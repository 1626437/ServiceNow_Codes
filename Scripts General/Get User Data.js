//Glide Ajax para coletar informações do usuário - Item de Catalogo
//--> Client Script:
function onLoad() {
    //Type appropriate comment here, and begin script below
    var user = g_user.userID;
    var infoUser = [];
    //alert(user);
    var ga = new GlideAjax('getUser');
    ga.addParam('sysparm_name', 'getData');
    ga.addParam('sysparm_userid', user);
    ga.getXMLWait();
    infoUser = ga.getAnswer().split(',');
    g_form.setValue('variables.question_email_solicitante', infoUser[0]);
    g_form.setValue('variables.question_centro_custo_contrato', infoUser[1]);
    g_form.setValue('variables.question_area_cliente_operacao', infoUser[2]);
    g_form.setValue('variables.question_cargo_solicitante', infoUser[3]);
    g_form.setReadOnly('variables.question_email_solicitante', true);
    g_form.setReadOnly('variables.question_centro_custo_contrato', true);
    g_form.setReadOnly('variables.question_area_cliente_operacao', true);
    g_form.setReadOnly('variables.question_cargo_solicitante', true);
}
//----------------------------------------------------------------------------------
//--> Script Include:
var getUser = Class.create();
getUser.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getData: function () {
        var userID = this.getParameter('sysparm_userid');
        var email = '';
        var costCenter = '';
        var clienteOperacao = '';
        var area = '';
        var title = '';
        var userData = '';
        var getInfo = new GlideRecord('sys_user');
        getInfo.addEncodedQuery('sys_id=' + userID);
        getInfo.query();
        if (getInfo.next()) {
            email = getInfo.email;
            costCenter = getInfo.department.name;
            clienteOperacao = getInfo.u_description;
            area = getInfo.u_office;
            title = getInfo.title;
        }
        var areaClientOperacao = area + '-' + clienteOperacao;
        userData = (email + ',' + costCenter + ',' + areaClientOperacao + ',' + title);
        gs.log('Dados: ' + userData);
        return userData;
    },
    type: 'getUser'
});