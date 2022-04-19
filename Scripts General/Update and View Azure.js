//Código para ser executado no Script Background ou Explore
var current = GlideRecord('change_request');
current.get('sys_id','09b702901bfa4190b552da4be54bcb59');
var matrizLabels = [];


	if (current.u_labels_selecionados.getDisplayValue().indexOf(',') > -1) {
	    matrizLabels = current.u_labels_selecionados.getDisplayValue().split(', ');
	} else {
	    matrizLabels[0] = current.u_labels_selecionados.getDisplayValue();
	}

	for (var x = 0; x < matrizLabels.length; x++) {
	    //var gaConsulta = new ConsultaAzureTimLabel();
	      gs.addInfoMessage(conditionUpdateLabel(matrizLabels[x], current));
	}
//----------------------------- || ----------------- || --------------------
//Função reponsável para consumir o ID da Label para atualização do status
    function getID(label) {

        var labelresult = this.encodeValueURL(label);


        try {

            //Variável que armazenará o endpoint + payload. 
            var urlGetLabel = "https://analytics.dev.azure.com/timbrasil/DEV%20-%20ServiceNow%20ITSM/_odata/v3.0-preview/WorkItems?&$filter=WorkItemType%20eq%20%27Entrega%27%20and%20Title%20eq%20%27" + labelresult + "%27%20&%20$select=WorkItemId,%20Title,%20WorkItemType,%20state";

            //Inicia a comunicação com o Azure da TIM
            var getLabel = new sn_ws.RESTMessageV2('global.API Azure TIM', 'GET LABEL');
            getLabel.setEndpoint(urlGetLabel);
            getLabel.setHttpMethod('get');
            var response = getLabel.execute();
            var httpStatus = response.getStatusCode();

            //Verifica se a comunicação foi OK
            if (httpStatus == 200) {
                var responseBody = response.getBody();
                var jsonParse = JSON.parse(responseBody);
                if (jsonParse.value.length == 1) {
                    //Retorna o camo ID
                    return jsonParse.value[0].WorkItemId;

                } else if (jsonParse.value.length > 1) {
                    var prop = gs.getProperty('azure.devops.state.inactive');
                    var aux_position;
                    var aux = 0;

                    for (var i = 0; i < jsonParse.value.length; i++) {
                        if (this.isInactive(jsonParse.value[i].State, prop)) {
                            //Não faz nada pq aqui entra somente os inativos
                        } else {
                            aux++;
                            aux_position = i;
                        }
                    }

                    if (aux != 1) {
                        gs.addErrorMessage('Label vinculado a change se encontra duplicada no Azure!');
                        return '';

                    } else {
                        return jsonParse.value[aux_position].WorkItemId;
                    }
                } else {
                    gs.addErrorMessage('Label vinculado a change se encontra inválida no Azure!');
                    return '';
                }
            } else {
                gs.addErrorMessage('Instabilidade de conexão com o Azure!');
                return '';
            }

        } catch (exAtt) {
            var messageBase64 = ex.messageAtt;
            gs.info(messageBase64);
        }
    }

    //Responsável para obter o State da Label
	function getState(label) {

        var labelresult = this.encodeValueURL(label);


        try {

            //Variável que armazenará o endpoint + payload. 
            var urlGetLabel = "https://analytics.dev.azure.com/timbrasil/DEV%20-%20ServiceNow%20ITSM/_odata/v3.0-preview/WorkItems?&$filter=WorkItemType%20eq%20%27Entrega%27%20and%20Title%20eq%20%27" + labelresult + "%27%20&%20$select=WorkItemId,%20Title,%20WorkItemType,%20state";

            //Inicia a comunicação com o Azure da TIM
            var getLabel = new sn_ws.RESTMessageV2('global.API Azure TIM', 'GET LABEL');
            getLabel.setEndpoint(urlGetLabel);
            getLabel.setHttpMethod('get');
            var response = getLabel.execute();
            var httpStatus = response.getStatusCode();

            //Verifica se a comunicação foi OK
            if (httpStatus == 200) {
                var responseBody = response.getBody();
                var jsonParse = JSON.parse(responseBody);
                if (jsonParse.value.length == 1) {
                    //Retorna o camo ID
                    return jsonParse.value[0].State;

                } else if (jsonParse.value.length > 1) {
                    var prop = gs.getProperty('azure.devops.state.inactive');
                    var aux_position;
                    var aux = 0;

                    for (var i = 0; i < jsonParse.value.length; i++) {
                        if (this.isInactive(jsonParse.value[i].State, prop)) {
                            //Não faz nada pq aqui entra somente os inativos
                        } else {
                            aux++;
                            aux_position = i;
                        }
                    }

                    if (aux != 1) {
                        gs.addErrorMessage('Label vinculado a change se encontra duplicada no Azure!');
                        return '';

                    } else {
                        return jsonParse.value[aux_position].State;
                    }
                } else {
                    gs.addErrorMessage('Label vinculado a change se encontra inválida no Azure!');
                    return '';
                }
            } else {
                gs.addErrorMessage('Instabilidade de conexão com o Azure!');
                return '';
            }

        } catch (exAtt) {
            var messageBase64 = ex.messageAtt;
            gs.info(messageBase64);
        }
    }

    //Função responsável de realizar o DE-PARA para atualização da Label no Azure
    function conditionUpdateLabel(label, change) {
        var stateLabel = this.getState(label);
        var idLabel = this.getID(label);
        var resultadoUpdate;

		gs.info('-->verifica se o GetID: ' + idLabel + ' e o GetState: '+stateLabel);
		gs.info('-->Change: ' + change.close_code);

        switch(change.close_code.getValue()){
			case 'successful':
				if(stateLabel.indexOf('PRÉ-PROD') > -1){
					var arr = [];
					var obj = {};
					obj['op'] = 'add';
					obj['path'] = "/fields/System.State";
					obj["value"] = "Instalada em PRÉ-PROD";
					arr[0] = obj;
					var payload = JSON.stringify(arr);
					gs.info('--> Analise do Campo Data de Instalação no Azure: ' + payload);
					resultadoUpdate = updateLabel(idLabel,payload);
				}else{
					var arr = [];
					var obj = {};
					obj['op'] = 'add';
					//Campo Data de Instalação no Azure
					obj['path'] = "/fields/Custom.c9ec7a85-d4c6-4f19-bfe8-94cbc183499b";
					obj["value"] = change.end_date;
					arr[0] = obj;
					var payload = JSON.stringify(arr);
					resultadoUpdate = updateLabel(idLabel,payload);
					var obj1 = {};
					obj1['op'] = 'add';
					obj1['path'] = "/fields/System.State";
					obj1["value"] = "Instalada em PROD";
					arr[0] = obj1;
					var payload1 = JSON.stringify(arr);
					resultadoUpdate = updateLabel(idLabel,payload1);
				}
				break;
			case 'successful_issues_label':
				gs.info('Case funcionando? R: ' + stateLabel.indexOf('PRÉ-PROD'));
				if(stateLabel.indexOf('PRÉ-PROD') > -1){
					var array = [];
					var obj = {};
					obj['op'] = 'add';
					obj['path'] = "/fields/System.State";
					obj["value"] = "Sucesso Parcial em PRÉ-PROD";
					array[0] = obj;
					var payload = JSON.stringify(array);
					resultadoUpdate = this.updateLabel(idLabel,payload);
				}else{
					var array = [];
					var obj = {};
					obj['op'] = 'add';
					//Campo Data de Instalação no Azure
					obj['path'] = "/fields/Custom.c9ec7a85-d4c6-4f19-bfe8-94cbc183499b";
					obj["value"] = change.end_date.getValue();
					array[0] = obj;
					var payload = JSON.stringify(array);
					gs.info('--> Analise do Campo Data de Instalação no Azure: ' + payload);
					resultadoUpdate = this.updateLabel(idLabel,payload);
					var obj0 = {};
					obj0['op'] = 'add';
					//Campo Informações Adicionais
					obj0['path'] = "/fields/Custom.4860fe37-04d3-4203-b6c3-ad0f95ab9fcf";
					obj0["value"] = change.close_notes.getValue();
					gs.info('--> Analise do Campo Informações Adicionais no Azure: ' + change.close_notes);
					array[0] = obj0;
					var payload0 = JSON.stringify(array);
					resultadoUpdate = this.updateLabel(idLabel,payload0);
					var obj1 = {};
					obj1['op'] = 'add';
					obj1['path'] = "/fields/System.State";
					obj1["value"] = "Instalada em PROD";
					array[0] = obj1;
					var payload1 = JSON.stringify(array);
					resultadoUpdate = this.updateLabel(idLabel,payload1);
				}
				break;
			case 'successful_issues':
				if(stateLabel.indexOf('PRÉ-PROD') > -1){
					var obj = {};
					obj['op'] = 'add';
					obj['patch'] = "/fields/System.State";
					obj["value"] = "Instalada em PROD";
					var payload = JSON.stringify(obj);
					resultadoUpdate = this.updateLabel(idLabel,payload);
				}else{
					var obj = {};
					obj['op'] = 'add';
					//Campo Data de Instalação no Azure
					obj['patch'] = "/fields/Custom.c9ec7a85-d4c6-4f19-bfe8-94cbc183499b";
					obj["value"] = change.end_date;
					var payload = JSON.stringify(obj);
					resultadoUpdate = this.updateLabel(idLabel,payload);
					var obj1 = {};
					obj1['op'] = 'add';
					obj1['patch'] = "/fields/System.State";
					obj1["value"] = "Instalada em PROD";
					var payload1 = JSON.stringify(obj1);
					resultadoUpdate = this.updateLabel(idLabel,payload1);
				}
				break;
			case 'unsuccessful_label':
				if(stateLabel.indexOf('PRÉ-PROD') > -1){
					var obj = {};
					obj['op'] = 'add';
					obj['patch'] = "/fields/System.State";
					obj["value"] = "Falha na Instalação em PRÉ-PROD";
					var payload = JSON.stringify(obj);
					resultadoUpdate = this.updateLabel(idLabel,payload);
				}else{
					var obj = {};
					obj['op'] = 'add';
					//Campo Data de Instalação no Azure
					obj['patch'] = "/fields/Custom.c9ec7a85-d4c6-4f19-bfe8-94cbc183499b";
					obj["value"] = change.end_date;
					var payload = JSON.stringify(obj);
					resultadoUpdate = this.updateLabel(idLabel,payload);
					var obj0 = {};
					obj0['op'] = 'add';
					//Campo Informações Adicionais
					obj0['patch'] = "/fields/Custom.4860fe37-04d3-4203-b6c3-ad0f95ab9fcf";
					obj0["value"] = change.close_notes;
					var payload0 = JSON.stringify(obj0);
					resultadoUpdate = this.updateLabel(idLabel,payload0);
					var obj1 = {};
					obj1['op'] = 'add';
					obj1['patch'] = "/fields/System.State";
					obj1["value"] = "Instalada em PROD";
					var payload1 = JSON.stringify(obj1);
					resultadoUpdate = this.updateLabel(idLabel,payload1);
				}
				break;
			case 'unsuccessful':
			if(stateLabel.indexOf('PRÉ-PROD') > -1){
				var obj = {};
				obj['op'] = 'add';
        		obj['patch'] = "/fields/System.State";
        		obj["value"] = "Falha em outro artefato - PRÉ-PROD";
        		var payload = JSON.stringify(obj);
        		resultadoUpdate = this.updateLabel(idLabel,payload);
			}else{
				var obj = {};
				obj['op'] = 'add';
				//Campo Data de Instalação no Azure
        		obj['patch'] = "/fields/Custom.c9ec7a85-d4c6-4f19-bfe8-94cbc183499b";
        		obj["value"] = change.end_date;
        		var payload = JSON.stringify(obj);
        		resultadoUpdate = this.updateLabel(idLabel,payload);
        		var obj0 = {};
				obj0['op'] = 'add';
				//Campo Informações Adicionais
        		obj0['patch'] = "/fields/Custom.4860fe37-04d3-4203-b6c3-ad0f95ab9fcf";
        		obj0["value"] = change.close_notes;
        		var payload0 = JSON.stringify(obj0);
        		resultadoUpdate = this.updateLabel(idLabel,payload0);
        		var obj1 = {};
				obj1['op'] = 'add';
        		obj1['patch'] = "/fields/System.State";
        		obj1["value"] = "Instalada em PROD";
        		var payload1 = JSON.stringify(obj1);
        		resultadoUpdate = this.updateLabel(idLabel,payload1);
			}
			break;
	}

        if (resultadoUpdate != null && resultadoUpdate != '') {
            return resultadoUpdate;
        } else {
            return 'Devido problemas técnicos, não foi possível realizar a conclusão da Label no Azure, tente mais tarde.';
        }
    }

    //Função responsável por atualizar a Label quando a change mudar para encerrada
    function updateLabel(idLabel, payload) {
        try {

            //Variável que armazenará o endpoint + payload. 
            var urlGetLabel = "https://dev.azure.com/timbrasil/fa107a60-859c-4011-bf61-b19f0fa22b5b/_apis/wit/workitems/" + idLabel + "?api-version=6.0";

            //Inicia a comunicação com o Azure da TIM
            var getLabel = new sn_ws.RESTMessageV2('global.API Azure TIM', 'PATCH Label');
            getLabel.setEndpoint(urlGetLabel);
            getLabel.setStringParameterNoEscape('payload', payload);
            var response = getLabel.execute();
            var httpStatus = response.getStatusCode();

            //Verifica se a comunicação foi OK
            if (httpStatus == 200) {
                var responseBody = response.getBody();
                var jsonParse = JSON.parse(responseBody);
                gs.info(jsonParse);
                return 'Label vinculado a change se encontra atualizada no Azure com sucesso!';

            } else {
                return '';
            }

        } catch (exAtt) {
            var messageBase64 = ex.messageAtt;
            gs.info(messageBase64);
        }
    }

//Responsável por realizar a trativa de caracteres especiais ao pesquisar a Label
function encodeValueURL(str) {
	return encodeURIComponent(str).replace(/['()]/g, escape).replace(/\*/g, '%2A').replace(/%(?:7C|60|5E)/g, unescape);
}

    function creatPayload()