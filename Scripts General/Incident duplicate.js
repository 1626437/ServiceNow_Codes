//Codigo para executar em um Script Background ou Explore
var current = new GlideRecord('incident');
current.get('sys_id', ''); //Inserir o ID do registro que necessia aqui

//Verifica e relaciona incidentes duplicados aos seus Pais, criando um relacionamento Pai e filho
var incidentParent = new GlideRecord('incident');
incidentParent.addEncodedQuery('active=true^parent_incidentISEMPTY^category=' + current.category + '^subcategory=' +current.subcategory+ '^cmdb_ci=' +current.cmdb_ci +'^u_symptom='+ current.u_symptom);
incidentParent.query();
if (incidentParent.next()){
current.parent_incident = incidentParent.sys_id;
}