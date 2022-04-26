(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    //Incident Inbound

    var bdt = new BDT_Dataset();
    var tbl = bdt.integration.import_set[request.body.data.integration];
    var responseBody = {};
    var writer;
    var reverseRec;
	
	var test = JSON.stringify(request.body.data);
    gs.info('Payload de Entrada: ' + test);	

    if (tbl == null) {
        response.setContentType('application/json');
        response.setStatus(400);

        responseBody.result = {
            "errorMessage": "Integration " + request.body.data.integration + " not found"
        };

        writer = response.getStreamWriter();
        writer.writeString(JSON.stringify(responseBody));
        return;
    }

    var refId = request.body.data.reference_id;
    if (refId == null || refId == "") {
        response.setContentType('application/json');
        response.setStatus(400);

        responseBody.result = {};
        responseBody.result.integration = request.body.data.integration;
        responseBody.result.state = "error";
        responseBody.result.errorMessage = "Reference ID is mandatory.";


        writer = response.getStreamWriter();
        writer.writeString(JSON.stringify(responseBody));
        return;
    }

    /*
    	Primeiro passo. Criação do Registro de Referência.
    	Se o registro de referência existir, e estiver preenchido com ID LOCAL (u_local_id)
       seguirá com o processo, pois é uma atualização. 	
       
        Se for identificado um registro com o ID LOCAL nulo, abortará a operação, retornando status 400.
       
        Caso contrário, tentará executar a operação para criar o registro de referência, com os valores da integração e do ID de referência.
    	ID Local será NULO nesse momento.
    	
    	A tabela Reference Record possui uma Regra de Negócio Sincrona que avalia os campos Reference ID e Integração. 
    	Se já existir um registro com os mesmos valores, retornará uma exceção que resultará em um erro 400. Bloqueando a continuidade
       desse script, para evitar duplicidade de registros na integração.
    */

    var rec_id;
    var parent_rec_id;
    var rec = new GlideRecord("x_cabs4_bdt_reference_record");
    var parentRec = new GlideRecord("x_cabs4_bdt_reference_record");

    rec.addQuery("u_integration", "TIM_REQUEST");
    rec.addQuery("u_reference_id", request.body.data.parent_id);
    rec.addNullQuery("u_local_id");
    rec.query();
	//No SC Task ele entra nesse if
    if (rec.next()) {
        response.setContentType('application/json');
        response.setStatus(400);

        responseBody.result = {};
        responseBody.result.integration = request.body.data.integration;
        responseBody.result.state = "error";
        responseBody.result.errorMessage = "Request Ticket creation is in process. Please try again later.";


        writer = response.getStreamWriter();
        writer.writeString(JSON.stringify(responseBody));
        return;
    }

    rec = new GlideRecord("x_cabs4_bdt_reference_record");
    parentRec = new GlideRecord("x_cabs4_bdt_reference_record");

    rec.addQuery("u_integration", "TIM_REQUEST");
    rec.addQuery("u_reference_id", request.body.data.parent_id);
    rec.addNotNullQuery("u_local_id");
    rec.query();
    if (rec.getRowCount() == 0) {

        parentRec.initialize();
        parentRec.u_integration = request.body.data.parent_integration.toString();
        parentRec.u_reference_id = request.body.data.parent_id.toString();
        parentRec.insert();
        parent_rec_id = parentRec.getUniqueValue();

    }

    rec = new GlideRecord("x_cabs4_bdt_reference_record");

    // Verificando o item da requisição (RITM)
    rec.addQuery("u_integration", request.body.data.integration);
    rec.addQuery("u_reference_id", request.body.data.reference_id);
    rec.addNullQuery("u_local_id");
    rec.query();

    if (rec.next()) {
        response.setContentType('application/json');
        response.setStatus(400);

        responseBody.result = {};
        responseBody.result.integration = request.body.data.integration;
        responseBody.result.state = "error";
        responseBody.result.errorMessage = "Ticket creation in process.";


        writer = response.getStreamWriter();
        writer.writeString(JSON.stringify(responseBody));
        return;
    }

    rec = new GlideRecord("x_cabs4_bdt_reference_record");
    var newRec = new GlideRecord("x_cabs4_bdt_reference_record");


    rec.addQuery("u_integration", request.body.data.integration);
    rec.addQuery("u_reference_id", request.body.data.reference_id);
    rec.addNotNullQuery("u_local_id");
    rec.query();
    if (rec.getRowCount() == 0) {
        newRec.initialize();

        newRec.u_integration = request.body.data.integration.toString();
        newRec.u_reference_id = request.body.data.reference_id.toString();

        newRec.insert();
        rec_id = newRec.getUniqueValue();
    }

    gr = new GlideRecord(tbl);
    gr.initialize();

    var keys = [];
    var obj = {};

    var fieldMappings = {};
    fieldMappings = bdt.getFieldMappings(request.body.data.integration);



    for (var key in request.body.data) {
        gr[fieldMappings[key]] = request.body.data[key];
        gs.info("POST INC: " + fieldMappings[key]);
    }
    
	// Additional fields to bug fixs
	gr.u_assignment_group = request.body.data.assignment_group;
	gr.u_assigned_to = request.body.data.assigned_to;
	gr.u_impact = request.body.data.impact;
	gr.u_work_notes = request.body.data.work_notes;
	gr.u_comments = request.body.data.comments;
	gr.u_stage = request.body.data.stage;
	gr.u_due_date = request.body.data.due_date;
	
    gs.info("  " + fieldMappings);
	
	gr.u_variables = request.body.data.variables;

    gr.insert();

    var resultSysId = gr.sys_id;

    gr = new GlideRecord(tbl);
    gr.get(resultSysId.toString());
    var sys_import_state = gr.sys_import_state.toString();
    var correlation_id = gr.u_correlation_id.toString();

    var responseNumber;
    var responseSysId;
    var targetTable;
    responseBody.result = {};

    if (sys_import_state == "skipped" && 
    gr.sys_row_error.getDisplayValue().indexOf("Unable to resolve target record, coalesce values not present") != -1) {

        gr = new GlideRecord(tbl);
        gr.addQuery("sys_import_state", "inserted");
        gr.addQuery("u_correlation_id", correlation_id);
        gr.query();

        if (gr.next()) {
            //Continues.
        } else {

            response.setContentType('application/json');
            response.setStatus(400);
            responseBody.result.errorMsg = "Skipped";
            gs.debug("BDT Incident - Skipped");
            writer = response.getStreamWriter();
            writer.writeString(JSON.stringify(responseBody));

            reverseRec = new GlideRecord("x_cabs4_bdt_reference_record");
            reverseRec.get("sys_id", rec_id);
            reverseRec.deleteRecord();

            reverseRec = new GlideRecord("x_cabs4_bdt_reference_record");
            reverseRec.get("sys_id", parent_rec_id);
            reverseRec.deleteRecord();


            return;
        }
    }

    responseBody.result.integration = request.body.data.integration;
    responseBody.result.state = gr.sys_import_state.toString();

    // Detalhes da RITM a partir do registro de referência:

    rec = new GlideRecord("x_cabs4_bdt_reference_record");
    rec.addQuery("u_integration", request.body.data.integration);
    rec.addQuery("u_reference_id", request.body.data.reference_id);
    rec.addNotNullQuery("u_local_id");
    rec.query();

    if (rec.next()) {
        responseBody.result.sys_id = rec.u_local_id.toString();
        responseBody.result.number = rec.u_local_id.getDisplayValue();
        responseBody.result.table = "sc_req_item";
    }

    grInc = new GlideRecord(gr.sys_target_table.toString());
    grInc.get(gr.sys_target_sys_id.toString());

    responseSysId = grInc.sys_id.toString();
    responseNumber = grInc.number.toString();

    if (responseNumber != null && responseNumber != "")
        responseBody.result.parent = {};
    responseBody.result.parent.integration = request.body.data.parent_integration;

    responseBody.result.parent.number = responseNumber;

    if (responseSysId != null && responseSysId != "")
        responseBody.result.parent.sys_id = responseSysId;

    targetTable = grInc.sys_class_name.toString();
    if (targetTable != null && targetTable != "")
        responseBody.result.parent.table = targetTable;

    if (gr.sys_row_error.getDisplayValue() != null && gr.sys_row_error.getDisplayValue() != "") {
        responseBody.result.errorMsg = gr.sys_row_error.getDisplayValue();
    }
	
    if (responseSysId == null || responseSysId == "") {


        response.setContentType('application/json');
        response.setStatus(400);
        responseBody.result.errorMsg = "Error";
        writer = response.getStreamWriter();
        writer.writeString(JSON.stringify(responseBody));


        reverseRec = new GlideRecord("x_cabs4_bdt_reference_record");
        reverseRec.get("sys_id", rec_id);
        reverseRec.deleteRecord();
    }
	
    response.setContentType('application/json');
    response.setStatus(200);


    writer = response.getStreamWriter();
    writer.writeString(JSON.stringify(responseBody));

})(request, response);