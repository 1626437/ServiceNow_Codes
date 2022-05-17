/*************************************
  global.Create_and_Set_Payload
 *************************************/
  var CAP_Create_and_Set_Payload = Class.create();
  CAP_Create_and_Set_Payload.prototype = {
      initialize: function() {},
  
      consultTableFields: function(table, filter, field, setlimit, order) {
          var obj = {};
          var arr = [];
          var u_field = field.toString();
          var fields = u_field.split(' | ');
          var fieldName = fields[0].split(',');
          var fieldValue = fields[1].split(',');
  
          var gr = new GlideRecord(table);
          gr.addEncodedQuery(filter);
          gr.orderByDesc(order);
          if (setlimit)
              gr.setLimit(1);
          gr.query();
          if (gr.getRowCount() > 1) {
              while (gr.next()) {
                  for (var i = 0; i < fieldName.length; i++) {
                      obj[fieldName[i]] = this.internalTypeField(table, fieldValue[i].toString(), gr);
                  }
                  arr.push(obj);
                  obj = {};
              }
              return arr;
          } else {
              gr.next();
              for (var x = 0; x < fieldName.length; x++) {
                  obj[fieldName[x]] = this.internalTypeField(table, fieldValue[x].toString(), gr);
              }
              return obj;
          }
      },
  
      consultTableFieldValue: function(table, filter, field) {
          var obj = [];
          var gr = new GlideRecord(table);
          gr.addEncodedQuery(filter);
          gr.query();
          if (gr.getRowCount() > 1) {
              while (gr.next()) {
                  obj.push(this.internalTypeField(table, field, gr));
              }
              return obj;
          } else if (gr.getRowCount() == 1) {
              gr.next();
              return this.internalTypeField(table, field, gr);
          } else {
              return '';
          }
      },
  
      internalTypeField: function(table, fieldValue, obj) {
          if (obj.getValue(fieldValue) != '' && obj.getValue(fieldValue) != null) {
        //Conversão para analisar o tipo do campo
        var recObj = new GlideRecord(table);
        var glideElement = recObj.getElement(fieldValue);
        var descriptor = glideElement.getED();
        var internalType = descriptor.getInternalType();
        var fieldType = internalType + '';
        var result;
    
              switch (fieldType) {
                  case 'glide_duration':
                      result = obj[fieldValue].getDurationValue();
                      break;
                  case 'glide_date_time':
                      var gdt = new GlideDateTime(obj.getValue(fieldValue));
                      var d = new Date(gdt.getNumericValue() + gdt.getTZOffset() + gdt.getDSTOffset());
                      result = d.toISOString();
                      break;
                  default:
                      result = obj.getDisplayValue(fieldValue.toString());
              }
              return result;
          } else {
              return '';
          }
  
      },
  
      setRestMessage: function(name, methodName, methodType, payload) {
          //Variavéis auxliares para montagem do payload para inserção na tabela u_integration
          var requestAll = {};
          var responseAll = {};
          var integration = {};
          var result = {};
          var sm;
          var response;
          var responseStatusCode;
          var requestBody;
          var responseBody;
          var requestAddress;
          var requestHeaders;
          var responseHeaders;
          var properties = gs.getProperty("u_integration.filter.status_code");
  
          try {
              //Chama o Rest Message para passar o objeto da tabela de origem e obter as informações de retorno
              sm = new sn_ws.RESTMessageV2(name, methodName);
              sm.setStringParameterNoEscape("payload", payload);
              response = sm.execute();
              responseStatusCode = response.getStatusCode();
              responseBody = JSON.stringify(response.getBody());
              requestAddress = sm.getEndpoint();
          } catch (ex) {
              var message = ex.message;
              gs.error("Erro na comunicação: " + message);
          } finally {
              responseAll.date = new GlideDateTime().getDisplayValue(); // armazena a data/hora corrente
              requestBody = sm.getRequestBody();
              requestHeaders = JSON.stringify(sm.getRequestHeaders());
              responseHeaders = JSON.stringify(response.getHeaders());
          }
  
          //Cria obj de Monitoração para inserção na tabela
          integration.name = name;
          integration.service = methodName;
          requestAll.date = new GlideDateTime().getDisplayValue(); // armazena a data/hora corrente
          requestAll.http_method = methodType;
          requestAll.address = requestAddress;
          requestAll.headers = requestHeaders;
          requestAll.payload = requestBody;
          responseAll.http_status_code = responseStatusCode;
          responseAll.headers = responseHeaders;
          responseAll.payload = responseBody;
          result.integration = integration;
          result.request = requestAll;
          result.response = responseAll;
  
          //Script Include que inseri na Tabela de Integration
          if (responseStatusCode >= properties) {
              var scriptInclud = new Integration();
              scriptInclud.put(result);
          }
  
          //Função para atualizar o Registro
          if (responseStatusCode < 400)
              return true;
          else
              return false;
  
      },
  
      type: 'CAP_Create_and_Set_Payload'
  };
  
  /*****************************************************************
           Scheduled.Envio de Eventos para Sistema Externo
   *****************************************************************/
  
  var log = {};
  
  //Propriedades para obter os filtros e campos
  var filter = JSON.parse(gs.getProperty("query.table"));
  var field = JSON.parse(gs.getProperty("fields.table"));
  
  var dataset = new CAP_Create_and_Set_Payload();
  
  //Query que faz uma consulta junto com a tabela notas de Fechamentos, para diminuir a quantidade de registros
  var gr = new GlideRecord('u_ttm');
  gr.addEncodedQuery(filter.u_ttm);
  gr.orderByDesc('sys_updated_on');
  gr.query();
  while (gr.next()) {

        //Criação do Payload
        log = dataset.consultTableFields('u_ttm', filter.all + gr.getUniqueValue(), field.u_ttm,false);
        log.id_servico = dataset.consultTableFieldValue('u_rede_dinamic_trail', filter.u_rede_dinamic_trail + gr.getUniqueValue(),'u_id');
        log.notas_de_fechamentos = dataset.consultTableFields('u_notas_de_fechamento_de_tasks', filter.u_notas_de_fechamento_de_tasks + gr.getUniqueValue(), field.u_notas_de_fechamento_de_tasks,true, 'u_task.closed_at');
      
        gs.info('Payload:' + JSON.stringify(log));
        var aux = dataset.setRestMessage('Sistem Externo', 'Metodo', 'POST',  JSON.stringify(log));
        
        //Valida envio do Evento
        if(aux){
          gs.info('Integração efetuada com sucesso!');
        }else{
          gs.info('Integração não efetuada com sucesso!');
        } 	
  }
  
  