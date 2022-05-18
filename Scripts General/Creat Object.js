/**********************************************************************
 *       Script para ser executado no Background ou Xplore
 **********************************************************************/
//campos que devem ser inserido no Object
var field = {
    "u_ttm": {
        "evento": "number",
        "falha": "u_falha",
        "status": "state",
        "hora_criacao": "sys_created_on",
        "data_validacao": "u_data_da_validacao",
        "stop_time": "u_tempo_stop_time"
    }
};
var obj = {};

var gr = new GlideRecord('u_ttm');
gr.addEncodedQuery('sys_updated_on>=javascript:gs.beginningOfLastMonth()^u_set_bpaas=false^state=8^RLQUERYu_notas_de_fechamento_de_tasks.u_ttm,>=1^u_responsavel_pelo_defeito=Intelig^ENDRLQUERY');
gr.setLimit('1'); // Set limit so the query does not delete more users 
gr.query();
while (user.next()) {
    for (var i = 0; i < Object.keys(field.u_ttm).length; i++) {
        var field_name = Object.keys(field.u_ttm)[i];
        var field_value = field.u_ttm[Object.keys(field.u_ttm)[i]]
        obj[field_name] = gr.getDisplayValue(field_value);
    }
} 
gs.info('Objeto: ' + JSON.stringify(obj));