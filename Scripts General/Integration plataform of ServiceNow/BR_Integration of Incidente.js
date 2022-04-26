(function executeRule(current, previous /*null when async*/ ) {
	//Check reference record
	var debug = true;
	var code = 'BDT Incident Update';
	var u_integration = "TIM";
	var reference_id = "";
	
	var grRef = new GlideRecord("x_timps_bdt_reference_record");
	grRef.addQuery('u_local_id', current.sys_id);
	grRef.addQuery('u_integration', u_integration);
	grRef.addQuery('u_table', current.sys_class_name);
	grRef.query();
	
	if(grRef.next()){
		reference_id = grRef.u_reference_id.toString();
		if(debug) gs.info(code+'reference_id:'+reference_id);
	}else{
		//Registros não encontrados para integração. Encerrando.
		if(debug) gs.info(code+'Registros não encontrados para integração. Encerrando.: ');
		return;
	}
	
    // Add your code here
    var obj = {};
	var arr = [];
	var dataset = new BDT_Dataset();
	obj = dataset.map(u_integration, "outbound", code, current);
    obj.integration = u_integration;
	obj.producer = "BDT Integration TIM";
	obj.number = reference_id;
	if(obj.assigned_to != '5fc7b2351b173050e9162170f54bcb6c' && obj.assigned_to != null && obj.assigned_to != undefined && obj.assigned_to != ""){
		obj.assigned_to = '5750f9131b57345005e6dca0f54bcb38';
	}
	obj.variables = JSON.stringify(obj.variables);
    arr.push(obj);
    var data1 = JSON.stringify(arr);
    var pl = data1.substring(1, data1.length - 1);
    try {
        var r = new sn_ws.RESTMessageV2('BDT Integration', 'BDT Incident');
        r.setStringParameterNoEscape("payload", pl);
        var response = r.execute();
        var responseBody = response.getBody();
    } catch (ex) {
        var message = ex.message;
		gs.debug("BDT Integration: "+ ex.toString());
    }
})(current, previous);