//Código para ser executado no Script Background ou Explore
var current = GlideRecord('change_request');
current.get('sys_id', '');//local onde deve inserir o sys_id do registro no ServiceNow
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
//----------------------------- || -->Funções que Realizam o processo de Integração<-- || --------------------
//Função reponsável para obter o ID da Label passada
function getID(label) {

	var labelresult = this.encodeValueURL(label);

	try {

		//Variável que armazenará o endpoint + a label de pesquisa 
		var urlGetLabel = "https://analytics.dev.azure.com/{company}/{project}/_odata/v3.0-preview/WorkItems?&$filter=WorkItemType%20eq%20%27Entrega%27%20and%20Title%20eq%20%27" + labelresult + "%27%20&%20$select=WorkItemId,%20Title,%20WorkItemType,%20state";

		//Inicia a comunicação com o Azure
		var getLabel = new sn_ws.RESTMessageV2('global.API Azure', 'GET LABEL');
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

		//Variável que armazenará o endpoint + a label de pesquisa. 
		var urlGetLabel = "https://analytics.dev.azure.com/{company}/{project}/_odata/v3.0-preview/WorkItems?&$filter=WorkItemType%20eq%20%27Entrega%27%20and%20Title%20eq%20%27" + labelresult + "%27%20&%20$select=WorkItemId,%20Title,%20WorkItemType,%20state";

		//Inicia a comunicação com o Azure
		var getLabel = new sn_ws.RESTMessageV2('global.API Azure', 'GET LABEL');
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

	switch (change.close_code.getValue()) {
		case 'successful':
			if (stateLabel.indexOf('PRÉ-PROD') > -1) {
				//Atualizando o campo de State no Azure			
				resultadoUpdate = creatPayload("/fields/System.State", "Instalada em PRÉ-PROD", idLabel);
			} else {
				//Atualizando o campo Data de Instalação no Azure
				creatPayload("/fields/Custom.c9ec7a85-d4c6-4f19-bfe8-94cbc183499b", change.end_date, idLabel);
				resultadoUpdate = creatPayload("/fields/System.State", "Instalada em PROD", idLabel);
			}
			break;
		case 'successful_issues':
			if (stateLabel.indexOf('PRÉ-PROD') > -1) {
				//Campo de State no Azure
				resultadoUpdate = creatPayload("/fields/System.State", "Sucesso Parcial em PRÉ-PROD", idLabel);
			} else {
				//Campo Data de Instalação no Azure
				creatPayload("/fields/Custom.c9ec7a85-d4c6-4f19-bfe8-94cbc183499b", change.end_date.getValue(), idLabel);
				//Campo Informações Adicionais no Azure
				creatPayload("/fields/Custom.4860fe37-04d3-4203-b6c3-ad0f95ab9fcf", change.close_notes.getValue(), idLabel);
				//Campo State no Azure
				resultadoUpdate = creatPayload("/fields/System.State", "Sucesso Parcial em PROD", idLabel);
			}
			break;
		case 'unsuccessful':
			if (stateLabel.indexOf('PRÉ-PROD') > -1) {
				//Campo de State no Azure
				resultadoUpdate = creatPayload("/fields/System.State", "Falha na Instalação em PRÉ-PROD", idLabel);
			} else {
				//Campo Data de Instalação no Azure
				creatPayload("/fields/Custom.c9ec7a85-d4c6-4f19-bfe8-94cbc183499b", change.end_date.getValue(), idLabel);
				//Campo Informações Adicionais no Azure
				creatPayload("/fields/Custom.4860fe37-04d3-4203-b6c3-ad0f95ab9fcf", change.close_notes.getValue(), idLabel);
				//Campo State no Azure
				resultadoUpdate = creatPayload("/fields/System.State", "Falha na Instalação em PROD", idLabel);
			}
			break;
	}

	if (resultadoUpdate != null && resultadoUpdate != '') {
		return resultadoUpdate;
	} else {
		return 'Devido problemas técnicos, não foi possível realizar a atualização da Label no Azure, tente mais tarde.';
	}
}

//Função responsável por atualizar a Label quando for solicitado 
function updateLabel(idLabel, payload) {
	try {

		//Variável que armazenará o endpoint 
		var urlGetLabel = "https://dev.azure.com/{company}/_apis/wit/workitems/" + idLabel + "?api-version=6.0";

		//Inicia a comunicação com o Azure da TIM
		var getLabel = new sn_ws.RESTMessageV2('global.API Azure', 'PATCH Label');
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

//Responsável por montar a estrutura de Payload que envia para o endpoint no método Path
function creatPayload(path, value, idLabel) {
	var arr = [];
	var obj = {};
	obj['op'] = 'add';
	obj['path'] = path;
	obj["value"] = value;
	arr[0] = obj;
	var payload = JSON.stringify(arr);
	var result = updateLabel(idLabel, payload);

	return result;
}