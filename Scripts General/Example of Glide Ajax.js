//Glide Ajax usando objeto como retorno
//--> ClientScript
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }
    var aluno = g_form.getValue('variables.nome');
    alert(aluno);
    var ga = new GlideAjax('AlunoUtils');
    ga.addParam('sysparm_name','alunoEspecRA');
    ga.addParam('sysparm_aluno',aluno);
    ga.getXMLAnswer(getReturn);
     function getReturn(response) {
        var obj = JSON.parse(response);
        g_form.setValue('variables.codigo_da_especialidade',obj.espec);
        g_form.setValue('variables.codigo_do_aluno',obj.ra);
     }
}
//-------------------------------------------------------------------------
//-->ScriptInclude
var AlunoUtils = Class.create();
AlunoUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
      alunoEspecRA: function() {
        var customer = this.getParameter('sysparm_aluno');
        var result = {};
          gs.info('ALUNO: '+customer);
        var getInfo = new GlideRecord('u_registro_academico');
        getInfo.addEncodedQuery('sys_id='+customer);
        getInfo.query();
        if (getInfo.next()){
            result.espec = getInfo.u_especialidade.toString();
            result.ra = getInfo.u_ra.toString();            
        }
        var response = global.JSON.stringify(result);
        return response;
    },
    type: 'AlunoUtils'
});