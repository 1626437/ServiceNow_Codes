//Script pode ser executado em um script Background ou Explore
var current = new GlideRecord('task');
current.get('sys_id', ''); //Inserir o ID do registro que necessia aqui

//Campo onde armazena a UF na TASK
var uf = current.u_id_task.u_event.u_uf.getDisplayValue();
//Campo onde armazena a Regional na TASK
var reg = current.u_id_task.u_event.u_regional_do_endereco.getDisplayValue();

 // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Obter grupo por operadora através da propriedade.
 // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var group_prop = gs.getProperty("cap.gestao_descarte.grupo_por_regional_operadora");
var json_group_prop = JSON.parse(group_prop);
var grp = json_group_prop[reg + "-" + uf];

if (grp != null && grp != "") {

    var grGrp = GlideRecord("sys_user_group");
    grGrp.addQuery("name", grp);
    grGrp.addQuery("active", true);
    grGrp.query();
    var ativ_grp = "";
    while (grGrp.next()) {
        ativ_grp = grGrp.getUniqueValue();
    }

}

gs.log('O sys_id do Grupo para a regional '+reg+' na UF '+uf+' é ' + ativ_grp);