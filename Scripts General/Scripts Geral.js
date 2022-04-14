//***************************************************************************************************************************************
//Cria uma lista com os valores de um campo do formulário, nesse caso o cano ic é usado para criar uma lista com suas áreas impactadas.
var impactedArea = new impactedArea();
current.u_impacted_areas = impactedArea.getimpactedArea(current.cmdb_ci);
current.update();
gs.addInfoMessage(gs.getMessage('Impacted Areas Updated'));
action.setRedirectURL(current); 
***************************************************************************************************************************************
//Evidencia usuário VIP 
Personalize Style(botão direita label)
TABLE: <tablename>
FIELD: <Caller>
VALUE: javascript:current.caller_id.vip == true
STYLE
background-image: url('images/icons/vip.gif');
background-repeat: no-repeat;
background-position: 98% 5px;
padding-right: 30px;
***************************************************************************************************************************************
//Identificar problema com CMDB, visualização congelada quando criado errado nesse caso a tabela u_firewall não existia
select sys_id, sys_class_name, name, sys_updated_by, sys_updated_on, sys_created_by, sys_created_on from cmdb_ci where sys_class_name = ‘u_firewall'
Only 1 record seems to be involved:
select sys_id, sys_class_name, name, sys_updated_by, sys_updated_on, sys_created_by, sys_created_on from cmdb_ci where sys_class_name = 'u_firewall'
sys_id, sys_class_name, name, sys_updated_by, sys_updated_on, sys_created_by, sys_created_on
6254dea20f187100ea81a218b1050e14, u_firewall, null, a-60004868, 2014-11-13 12:46:48, a-60004868, 2014-11-13 12:46:48
I've searched for 6254dea20f187100ea81a218b1050e14 in all your cmdb tables, and it only appears in:
cmdb_ci
cmdb_ci_hardware
cmdb_ci_netgear
This tells me u_firewall used to extend cmdb_ci_netgear, which extends cmdb_ci_hardware, and cmdb_ci.
Give the table was deleted, I will assume you also want the left-overs deleted as well.
The following script will clean these up. Run this as 'admin' from the "Scripts - Background" page:
gs.sql("DELETE FROM cmdb_ci WHERE sys_id = '6254dea20f187100ea81a218b1050e14' ");
gs.sql("DELETE FROM cmdb_ci_hardware WHERE sys_id = '6254dea20f187100ea81a218b1050e14' ");
gs.sql("DELETE FROM cmdb_ci_netgear WHERE sys_id = '6254dea20f187100ea81a218b1050e14' “);
***************************************************************************************************************************************
//Esconder as TABs de acordo com algum outro valor em algum campo
function onChange(control, oldValue, newValue, isLoading) {
     var sections = g_form.getSections();
     if (newValue == '6'||newValue == '7') {
          sections[3].style.display = 'block';
     } else {
          sections[3].style.display = 'none';
     }
}
***************************************************************************************************************************************
//ui policy para remover os valores dos campos.
function onCondition() {    
     g_form.removeOption('state',2);  //Work in Progress
     g_form.removeOption('state',-5); //On Hold
     g_form.removeOption('state',-3); //Request for Approval
function onCondition() {
     g_form.removeOption('type','Routine');
     g_form.addOption('type','Comprehensive','Comprehensive');
     g_form.addOption('type','Emergency','Emergency');
     g_form.addOption('type','','');
}
***************************************************************************************************************************************
//Para pegar a ClassName da tabela task
&& current.getRecordClassName() == 'incident' || current.getRecordClassName() == 'problem'
Definir um grupo de designação no workflow
var option = current.variables.access_select.toString();
switch(option) {
    case 'SAP_BI':
        current.assignment_group.setDisplayValue('BI Security');
        break;
    case 'SAP_Transactions':
        current.assignment_group.setDisplayValue('SAP Security');
        break;
    case 'TOTVS_Transactions':
        current.assignment_group.setDisplayValue('ERP Latam Security');
        break;
    case 'Sofcrates_Transactions':
        current.assignment_group.setDisplayValue('ERP Latam Security');
        break;
    case 'Network_Shared_Driver':
        current.assignment_group.setDisplayValue('Global SD');
        break;
    case 'LIMS':
        current.assignment_group.setDisplayValue('Global User Admin');
        break;
    case 'Other_Systems':
        current.assignment_group.setDisplayValue('Global User Admin');
        break;
     case 'servicenow':
        current.assignment_group.setDisplayValue('ServiceNow Administration Team');
        break;
     case 'reactivate_user_maternity_leave':
        current.assignment_group.setDisplayValue('Global User Admin');
        break;
     case 'SAP_Emergency_Access':
          current.assignment_group.setDisplayValue('SAP Emergency Access');
          current.urgency.setDisplayValue('1 - High');
          current.impact.setDisplayValue('3 - Low');
        break;
}
current.short_description = 'Additional Access - ' + current.variables.access_select.getDisplayValue();
function onSubmit() {
var cat_id = gel('sysparm_item_guid').value;
var gr = new GlideRecord("sys_attachment");
gr.addQuery("table_name", "sc_cart_item");
gr.addQuery("table_sys_id", cat_id);
gr.query();
if (!gr.next()) {
alert("You must attach a request form");
return false;
}
***************************************************************************************************************************************
//Preenche campo telefone com o telefone de quem está abrindo o chamado
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading)
      return;
   if (newValue == '') {
      g_form.setValue('caller_id', '');
      return;
   }
   if (!g_form.getControl('caller_id'))
      return;
   var caller = g_form.getReference('caller_id', setPhone);
}
function setPhone(caller) {
   if (caller)
       g_form.setValue('u_callback_number', caller.phone);
}
/*Notificação periódica
------------------------------------------------------------------------------------------------------------------------------------------------
Description:
Send notification for unnaproved requested items each 2 days
--------------------------------------------------------------------------------------------------------------------------------------------------
 */
var gr = new GlideRecord ('sysapproval_approver');
var now = new Date();
var day = now.getDay();
gr.addQuery('state', 'requested');
gr.addQuery('sysapproval.sys_class_name', 'sc_req_item');
gr.query();
gs.log('** Automaticaly send e-mail 1**');
var item = new GlideRecord ('sc_req_item');
item.addQuery('sys_updated_on','<',gs.minutesAgo(10));
item.query();
while(gr.next())
{
     if(day!= 0 && day != 6)
     {
          gs.log('** Automaticaly send e-mail **');
          gs.eventQueue("timely.notification", gr, gr.approver.getDisplayValue());
     }
}
***************************************************************************************************************************************
//SCRIPT INCLUDE para filtrar um campo reference através de um campo choice associado a mesma tabela do reference.
function filterSublocation(){
     return 'u_macro_location=‘(campo usado para referenciar através do) + current.u_location;
}
***************************************************************************************************************************************
//Preenche empresa e comentários para um requested item. Business Rule executando em insert na tabela sc_req_item
if (current.variables.company != '' && current.variables.company != undefined)
current.company = current.variables.company;
if (current.variables.comments != '' && current.variables.comments != undefined)
current.comments = current.variables.comments;
if (current.variables.short_description != '' && current.variables.short_description != undefined)
current.short_description = current.variables.short_description;
if (current.variables.description != '' && current.variables.description != undefined)
current.description = current.variables.description;
***************************************************************************************************************************************
//Deleção em massa através de background script.
var gr = new GlideRecord('cmdb_ci');
gr.addQuery(’sys_class_name', 'cmdb_ci');
gr.query();
gr.deleteMultiple();
***************************************************************************************************************************************
//Altera o conteúdo do campo para Upper Case
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }  
   var str = newValue.toUpperCase(); 
   if (str != newValue) 
  g_form.setValue('u_contact_name', str); 
}
***************************************************************************************************************************************
//Chamar um mail script na notificação
${mail_script:sapReplyTo}
${mail_script:attach_links}
***************************************************************************************************************************************
Filtra Grupos em Fluxos
var userRegion = current.u_requester.location.u_region.toString();
var userSubRegion = current.u_requester.location.u_sub_region.toString();
var subRegion = userSubRegion.substring(0,5);
if (userRegion == '') {
     current.assignment_group.setDisplayValue('Global SD');
} else if (userRegion == 'Americas' && userSubRegion == ''){
     current.assignment_group.setDisplayValue('Region Americas');
} else {
     switch(subRegion){
          case 'Latin':
          current.assignment_group.setDisplayValue('Region Americas');
          break;
          case 'North':
          current.assignment_group.setDisplayValue('Region Americas');
          break;
     }
     switch(userRegion) {
          case 'Denmark':
          current.assignment_group.setDisplayValue('Region DK');
          break;
          case 'South_Europe':
          current.assignment_group.setDisplayValue('Region SE');
          break;
          case 'North_Earsten_Europe':
          current.assignment_group.setDisplayValue('Region NEE');
          break;
          case 'Asia_Pacific':
          current.assignment_group.setDisplayValue('Region AP');
          break;
     }
}
Preenche Valores na Requested Item na criação
if (current.variables.company != '' && current.variables.company != undefined)
current.company = current.variables.company;
if (current.variables.comments != '' && current.variables.comments != undefined)
current.comments = current.variables.comments;
if (current.variables.short_description != '' && current.variables.short_description != undefined)
current.short_description = current.variables.short_description;
if (current.variables.description != '' && current.variables.description != undefined)
current.description = current.variables.description;
***************************************************************************************************************************************
//Preenche Requested For com usuário solicitante selecionado na Requested Item
updateReqFor();
//NEED TO CHANGE IF WE HAVE SHOPPING CART
// Update Requested For
function updateReqFor() {
     var req = new GlideRecord('sc_req_item');
     req.addQuery('request', current.sys_id);
     req.setLimit(1);
     req.query();
     while (req.next()) {
          current.requested_for = req.variables.requested_for;
          current.short_description = req.short_description;
     }
}
//Verifica data e hora no futuro
function onChange(control, oldValue, newValue, isLoading) {
     var fieldDate = new Date(newValue.substr(6,4), parseInt(newValue.substr(3,2),10) - 1, newValue.substr(0,2), newValue.substr(11,2), newValue.substr(14,2), newValue.substr(17,2));
     // date time format = 24-05-2015 04:20:59 - Date(year, month, day, hours, minutes, seconds, milliseconds)
     var currentDate = new Date();
     if (currentDate.getTime() < fieldDate.getTime()) {
          alert(getMessage('error_abastece_data'));
          g_form.setValue('question_abastece_problema_parcial_q_6','');
     }
}
***************************************************************************************************
//Client Script/Ajax para preencher um campo com o DisplayValue e não com o sys_id (value);
     var caller = g_form.getDisplayValue('variables.u_caller');
     var ga = new GlideAjax('getUserInfo');
     ga.addParam('sysparm_name','getCompany');
     ga.addParam('sysparm_user_id',caller);
     ga.getXML(setCompanyValue);
     function setCompanyValue(response) {
          var answer = response.responseXML.documentElement.getAttribute("answer");
          g_form.setValue('variables.u_company', answer);
     }
}
//Glide AJAX
     getCompany: function(user_id) {
          var result = '';
          if (this.getParameter('sysparm_user_id')) {
               user_id = this.getParameter('sysparm_user_id');
               var ourUser = gs.getUser().getUserByID(user_id);
               result = ourUser.getCompanyID();
          } else {
               result = gs.getUser().getCompanyID();
          }
          return result;
     },
var ga = new GlideAjax('HelloWorld');
ga.addParam('sysparm_name','helloWorld');
ga.addParam('sysparm_user_name',"Bob");
ga.getXMLWait();
alert(ga.getAnswer());
//Esconde um botão da tela (client script onChange)
     hideSubmitButton('Submit');
     function hideSubmitButton(button) {
          //Hide the 'Submit' button
          var items = $$('BUTTON').each(function(item){
               if(item.innerHTML.indexOf(button) > -1){
                    item.hide();
               }
          });
***********************************************************************************************************************
//Atualização de múltiplos registros através de Scripts - Background
notification=69313ec90f820200c816945f62050e89
u_cpfISNOTEMPTY^u_birth_dateISNOTEMPTY
*UPDATE*
var updateCI = new GlideRecord(’task');
updateCI.addEncodedQuery(‘sys_class_name=sc_request');
updateCI.query();
while(updateCI.next()){
updateCI.sys_domain=‘atualização';
updateCI.setForceUpdate(true);
updateCI.setWorkflow(false);
updateCI.update();
}
notification=69313ec90f820200c816945f62050e89
*DELETE*
var user = new GlideRecord('tabela'); 
user.addEncodedQuery('condição'); 
//user.setLimit('7000'); // Set limit so the query does not delete more users 
user.query(); 
gs.log('Number of users to be deleted-->'+user.getRowCount()); 
//while(user.next()) 
//{ 
//user.deleteRecord(); 
//} 
***********************************************************************************************************************
//Excluir do formulário variáveis que estão vazias criar uma BR e um Client Script
•   BUSINESS RULE
var allVariables = [];
var excludedTypes = '[11][12][19][20][24]';
for(var variable in current.variable_pool){
     var type = '[' + current.variable_pool[variable].getGlideObject().getQuestion().getType() + ']';
     if(excludedTypes.indexOf(type)==-1){
          allVariables.push(variable);
     }
}
g_scratchpad.allIncidentVariables = allVariables.toString();
•   CLIENT SCRIPT
     g_form.setDisplay('variables.u_subcategory_l4',false);
function onLoad() {
     hideVariables();
}
function hideVariables(){
     var allVariables = g_scratchpad.allIncidentVariables.split(',');
     for (var allIndex=0; allIndex<allVariables.length; allIndex++){
          g_form.setMandatory("variables." + allVariables[allIndex],false);
          //g_form.setReadOnly("variables." + allVariables[allIndex],true);
          if(g_form.getValue("variables." + allVariables[allIndex])==''||g_form.getValue("variables." + allVariables[allIndex])=='self-service'){
               g_form.setDisplay("variables." + allVariables[allIndex],false);
          }
     }
}
***********************************************************************************************************************
//Consumir um WS e tratar o retorno do XML
try {
var s = new sn_ws.SOAPMessageV2('Correios', 'consultaCEP');
//override authentication profile
//authentication type ='basic'
//r.setAuthentication(authentication type,profile name);
s.setStringParameter('consultaCEP.cep', current.zip);
var response = s.execute();
var responseBody = response.getBody();
var status = response.getStatusCode();
//gs.log(responseBody);
var xmldoc = new XMLDocument(responseBody, true);
current.street = xmldoc.getNodeText("//end");
current.update();
action.setRedirectURL(current);
}
catch(ex) {
var message = ex.getMessage();
}
***********************************************************************************************************************
//Desabilitar Protection Policy de Read only para None
var gr = new GlideRecord("sys_metadata"); 
gr.get("d1ea2bf1cb200200d71cb9c0c24c9c15"); 
gs.print(gr.sys_policy); 
gr.sys_policy=""; 
gs.print(gr.sys_policy); 
gr.update();
3c1fe0f6d7032100b9bc43d60e610397
***********************************************************************************************************************
//Limpa variáveis do Variable Editor.
•   Pegar o ID da variável no console
•   Inserir o ID na função gel.
var recordID = gel('variable_ni.QS7771b1c63720e2006929008993990ec2');
recordID.style.display='none';
***********************************************************************************************************************
//PADRAO REUNIAO
//Bom dia, por favor utilizem o link abaixo para conectar a reunião.
https://servicenow.zoom.us/my/ricardo.linhart
Obrigado
Ricardo Linhart | Senior Technical Consultant
ServiceNow   | Everything  as a Service
(m) 55 11 99103 8194
Jabber +14084507382
Skypeid ricardo.linhart
4002-5700
Codigo da solicitação de Pontos AA - San Diego - S29279195
Tempo Total - Pendenciamento
***********************************************************************************************************************
//Remover Label Variable 
function onLoad() {
    if ($('variable_map'))
        $('variable_map').up('tr').previous().hide();
}
________________________________________
***********************************************************************************************************************
Readonly requested item variables
 g_form.setVariablesReadOnly(true);
***********************************************************************************************************************
//Preenche Requested For com o Caller do catalogo
function onBefore(current, previous) {
    updateReqFor();
    //NEED TO CHANGE IF WE HAVE SHOPPING CART
    // Update Requested For
    function updateReqFor() {
        var req = new GlideRecord('sc_req_item');
        req.addQuery('request', current.sys_id);
        req.setLimit(1);
        req.query();
        while (req.next()) {
            current.requested_for = req.variables.u_caller;
            current.short_description = req.short_description;
            current.description = req.description;
            //current.short_description = req.short_description;
        }
    }
}
________________________________________
//Limpa Instancia
doit("task_ci");
doit("cmn_notif_message");
doit("task_cmdb_ci_service");
doit("conflict");
doit("task_rel_kb");
doit("task_rel_task");
doit("metric_instance");
doit("sysapproval_approver");
doit("wf_context");
doit("sysapproval_group");
doit("task_sla");
doit("incident");
doit("problem");
doit("problem_task");
doit("change_request");
doit("change_task");
doit("sc_task");
doit("sc_req_item");
doit("sc_request");
doit("sys_trend");
doit("sys_watermark");
doit("sys_email”);
doit(“cmdb_ci_outage”);
function doit(table) {
var gr = new GlideRecord(table);
gr.deleteMultiple();
}
________________________________________
//Estagios de um Process Flow
1. Create process flow formatter for incident table with following stages:
   - Stage should be "Incident Identification and Categorization" when state is New
   - Stage should be "Investigation and Diagnosis" when state is Active, Awaiting User Info or Awaiting Problem.
   - Stage should be "Resolution" when state is Awaiting Change or Resolved.
   - Stage should be "Closure" when state is Closed.
***********************************************************************************************************************
Usando o getClientData para pegar valores inseridos através de um server script. Nesse exemplo coletando o idioma através da BR.
________________________________________
//Insere o sys_id do item de catalogo no campo Script do Record producer. Serve para passar o Sys ID do catalogo que ta end aberto para o 
var queryFiltro = 'table_name=hr_case';
var campoDaTabela = 'u_item';
var grProducer = new GlideRecord('sc_cat_item_producer');
grProducer.addEncodedQuery(queryFiltro);
grProducer.query();
while(grProducer.next()){
var script = 'current.' + campoDaTabela +  ' = "' + grProducer.sys_id + '";'; 
grProducer.script = script;
grProducer.update();
}
________________________________________
Glide Ajax para coletar informações do usuário - Item de Catalogo
Client Script:
function onLoad() {
     //Type appropriate comment here, and begin script below
     var user = g_user.userID;
     var infoUser = [];
//     alert(user);
     var ga = new GlideAjax('getUser');
     ga.addParam('sysparm_name','getData');
     ga.addParam('sysparm_userid',user);
     ga.getXMLWait();
     infoUser = ga.getAnswer().split(',');
     g_form.setValue('variables.question_email_solicitante',infoUser[0]);
     g_form.setValue('variables.question_centro_custo_contrato',infoUser[1]);
     g_form.setValue('variables.question_area_cliente_operacao',infoUser[2]);
     g_form.setValue('variables.question_cargo_solicitante',infoUser[3]);     
     g_form.setReadOnly('variables.question_email_solicitante',true);
     g_form.setReadOnly('variables.question_centro_custo_contrato',true);
     g_form.setReadOnly('variables.question_area_cliente_operacao',true);
     g_form.setReadOnly('variables.question_cargo_solicitante',true);     
}
Script Include:
var getUser = Class.create();
getUser.prototype = Object.extendsObject(AbstractAjaxProcessor,{
    getData: function() {
          var userID = this.getParameter('sysparm_userid');
          var email = '';
          var costCenter = '';
          var clienteOperacao = '';
          var area = '';
          var title = '';
          var userData = '';
          var getInfo = new GlideRecord('sys_user');
          getInfo.addEncodedQuery('sys_id='+userID);
          getInfo.query();
          if(getInfo.next()){
          email=getInfo.email;
          costCenter=getInfo.department.name;
          clienteOperacao = getInfo.u_description;
          area = getInfo.u_office;
          title = getInfo.title;
          }
          var areaClientOperacao = area+'-'+clienteOperacao;
          userData=(email+','+costCenter+','+areaClientOperacao+','+title);
          gs.log('Dados: '+userData);
          return userData;
    },
    type: 'getUser'
});
var user = nee GlideRecord(’sys_user’);
user.addEncodedQuery('locked_out=true’);
user.query();
while(user.next()){
user.locked_out=‘false’;
user.update();
}
________________________________________
Cancela Aprovação e RITM depois de X dias pendente de aprovação (requested)
(function executeRule(current, previous /*null when async*/) {
    var sidRitm = current.document_id.toString();
    var item = '';
    var getItem = new GlideRecord('sc_req_item');
    getItem.addEncodedQuery('sys_id='+sidRitm);
    getItem.query();
    if (getItem.next()){
        item = getItem.u_subcategoria_task;
    }
    if(item.toString()=='ee8afb1a6f45fac06bda17164b3ee426'){
        var canceltime1 = gs.getProperty('glide.ui.request.cancel.time');
        var pcanceltime1 = parseInt(canceltime1);
        var dataAtual1 = new GlideDateTime();
        dataAtual1.addDays(pcanceltime1);
        if (pcanceltime1 > 0) {
            //    var sidRitm = current.document_id.toString();
            //var dataAtual = new GlideDateTime();
            //dataAtual.addDays(7);
            //dataAtual.addSeconds(300);
            var scriptStr1 = "";
            scriptStr1 += "\nvar gr = new GlideRecord('sysapproval_approver');";
            //scriptStr += "\ngr.addEncodedQuery('state=requested^sys_id=" + sidRitm +"');";
            scriptStr1 += "\ngr.addEncodedQuery('state=requested^sysapproval.sys_id=" + sidRitm +"');";
            scriptStr1 += "\ngr.query();";
            scriptStr1 += "\nif(gr.next()){";
            scriptStr1 += "\n    gr.state = 'cancelled';";
            scriptStr1 += "\n    gr.update();";
            scriptStr1 += "\n}";
            scriptStr1 += "\n\n";
        }
    }
    else
        {
        var canceltime = gs.getProperty('glide.ui.request.cancel.time');
        var pcanceltime = parseInt(canceltime);
        var dataAtual = new GlideDateTime();
        dataAtual.addDays(pcanceltime);
        if (pcanceltime > 0) {
            //    var sidRitm = current.document_id.toString();
            var nome = "Aprovação automatica " + current.document_id.getDisplayValue() + " - Aprovador: " + current.approver.getDisplayValue();
            //var dataAtual = new GlideDateTime();
            //dataAtual.addDays(7);
            //dataAtual.addSeconds(300);
            var scriptStr = "";
            scriptStr += "\nvar gr = new GlideRecord('sysapproval_approver');";
            //scriptStr += "\ngr.addEncodedQuery('state=requested^sys_id=" + sidRitm +"');";
            scriptStr += "\ngr.addEncodedQuery('state=requested^sysapproval.sys_id=" + sidRitm +"');";
            scriptStr += "\ngr.query();";
            scriptStr += "\nif(gr.next()){";
            scriptStr += "\n    gr.state = 'cancelled';";
            scriptStr += "\n    gr.update();";
            scriptStr += "\n}";
            scriptStr += "\n\n";
            scriptStr += "\nvar gr2 = new GlideRecord('sc_req_item');";
            //scriptStr += "\ngr2.addEncodedQuery('sys_id=" + sidRitm +"');";
            scriptStr += "\ngr2.addEncodedQuery('state=100^sys_id=" + sidRitm +"');";
            scriptStr += "\ngr2.query();";
            scriptStr += "\nif(gr2.next()){";
            scriptStr += "\n    gs.eventQueue('request.cancelamento.automatico', gr2, gr2.request.requested_for, gr2.request.requested_for.getDisplayValue());";
            scriptStr += "\n    gr2.state = '400';";
            scriptStr += "\n    gr2.comments = 'Cancelado por falta de aprovação, aprovador: "+ current.approver.getDisplayValue() +"';";
            scriptStr += "\n    gr2.update();";
            scriptStr += "\n}";
            var gr = new GlideRecord('sys_trigger');
            gr.initialize();
            gr.name = nome;
            gr.next_action = dataAtual;
            gr.trigger_type = '0';
            gr.script = scriptStr;
            gr.insert();
        }
    }
})(current, previous);
________________________________________
List Control - Omit new condition / Omit edit condition
var answer = false;
if ((parent.state == 6) || (parent.state == 7)|| (parent.state = 8)) {
    answer = true;
} else {
    answer = false;
}
answer;
________________________________________
Copia RITM para outros usuários selecionados em variáveis
var newreq = new GlideRecord('sc_req_item');  
newreq.initialize();  
newreq.short_description = current.short_description;
newreq.description = current.description;
newreq.contact_type = 'req_interna';
newreq.request = current.request;
newreq.assignment_group = current.assignment_group;  
newreq.cat_item = current.cat_item;  
newreq.configuration_item = current.configuration_item;
newreq.priority = current.priority;  
newreq.comments = current.comments;  
newreq.work_notes = current.work_notes;  
var newRITM = newreq.insert();  
copyVariables();  
function copyVariables(){  
   var recMtom = new GlideRecord('sc_item_option_mtom');  
   recMtom.addQuery('request_item', current.sys_id);  
   recMtom.query();  
   while(recMtom.next()){  
   var newMtom = new GlideRecord('sc_item_option_mtom');  
   newMtom.initialize();  
   newMtom.request_item = newRITM;  
   newMtom.sc_item_option = recMtom.sc_item_option;  
   newMtom.insert();  
   }  
}  
________________________________________
Glide Ajax usando objeto como retorno
ClientScript
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
ScriptInclude
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
________________________________________
Instanciar Script Include (Scripts - Background)
var sInclude = new SetBookmarks()
sInclude._setToUser();
________________________________________
Criar uma tabela a partir de outra
copyTable(tabela q vc quer clonar, nome da tabela nova, nome da tabela pai , label da tabela nova);
por ex… quero clonar a incident
sem ter tabela pai...
copyTable(“incident”, “incident_new”, null, “Incidente Clonada”);
copyTable("u_tivit_incidents", "u_tivit_requests", "sys_import_set_row", "TIVIT Requests");
//copyTable('incident', 'new_incident', 'task’);
copyTable(‘u_cadastro_temporario_de_colaborador', ‘u_multiplos_colaboradores_temporaria', ‘Múltiplos Colaboradores temporaria');
function copyTable(originalTable, newTable, extendTable, label) {
  var gr = new GlideRecord(originalTable);
  gr.initialize();
  var td = GlideTableDescriptor.get(originalTable);
  var displayName = td.getDisplayName();
  var tLabel = label ? label : gr.getLabel();
  var creator = new TableDescriptor(newTable, tLabel);
  if (extendTable) {
    creator.setExtends(extendTable);
  }
  creator.setFields(gr);
  creator.copyAttributes(td);
  creator.setRoles(td);
  creator.create();
  creator.copyIndexes(originalTable, newTable);
}
//////////////////////////
copyTableData(’task_sla', ’u_rms_task_sla’);
function copyTableData(originalTable, newTable) {
  var gr = new GlideRecord(originalTable);
  gr.query();
  while (gr.next()) {
    var gr2 = new GlideRecord(newTable);
    gr2.intialize();
    for (k in gr) {
      if (k != 'sys_class_name') {
        gr2[k] = gr[k];
      }
 }
    gr2.setAutoSysFields(false);
    gr2.setWorkflow(false);
    gr2.insert();
  }
}
________________________________________
Set READONLY Variables
function onLoad(){
   try{
      //Get the 'Variables' section
      var ve = $('variable_map').up('table');
      //Disable all elements within with a class of 'cat_item_option'
      ve.select('.cat_item_option', '.slushselectmtm', '.questionsetreference').each(function(elmt){
         elmt.disabled = true;
      });
      //Remove any reference or calendar icons
      ve.select('img[src*=reference_list.gifx]', 'img[src*=small_calendar.gifx]').each(function(img){
         img.hide();
      });
      //Hide list collector icons
      ve.select('img[src*=arrow]').each(function(img){
         img.up('table').hide();
      });
   }
   catch(e){}
}
________________________________________
Formatar CPF onChange Client Script
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    console.log(oldValue,newValue);
    if (isLoading || newValue === '') {
        return;
    }
    g_form.hideFieldMsg('u_cpf');
    var onlyNumbers = newValue.replace(/[^0-9]/g, '');
    if(onlyNumbers.toString().length != 11){
        g_form.setValue('u_cpf', '');
        g_form.showFieldMsg('u_cpf','CPF inválido', 'error');
        return;
    }
    if(!newValue.match(/[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}/)){
        var formated = newValue.substr(0,3) + '.' + newValue.substr(3,3) + '.' + newValue.substr(6,3) + '-' + newValue.substr(9,2);
        g_form.setValue('u_cpf', formated);
    }
    var Soma;
    var Resto;
    Soma = 0;
    if (onlyNumbers == "00000000000" || onlyNumbers == "11111111111" || onlyNumbers == "22222222222" || onlyNumbers == "33333333333" || onlyNumbers == "44444444444" || onlyNumbers == "55555555555" || onlyNumbers == "66666666666" || onlyNumbers == "77777777777" || onlyNumbers == "88888888888" || onlyNumbers == "99999999999") {
        g_form.setValue('u_cpf', '');
        g_form.showFieldMsg('u_cpf','CPF inválido', 'error');
        return;
    }
    for (var i = 1; i <= 9; i++){
        Soma = Soma + parseInt(onlyNumbers.substring(i-1, i)) * (11 - i);
    }
    Resto = (Soma * 10) % 11;
    if ((Resto == 10) || (Resto == 11)){
        Resto = 0;
    }
    if (Resto != parseInt(onlyNumbers.substring(9, 10))){
        g_form.setValue('u_cpf', '');
        g_form.showFieldMsg('u_cpf','CPF inválido', 'error');
    }
    Soma = 0;
    for (i = 1; i <= 10; i++) {
        Soma = Soma + parseInt(onlyNumbers.substring(i-1, i)) * (12 - i);
    }
    Resto = (Soma * 10) % 11;
    if ((Resto == 10) || (Resto == 11)){
        Resto = 0;
    }
    if (Resto != parseInt(onlyNumbers.substring(10, 11) )){
        g_form.setValue('u_cpf', '');
        g_form.showFieldMsg('u_cpf','CPF inválido', 'error');
    }
    return;
}
________________________________________
Integração para volta dos dados do ServiceNow para um banco de dados (Oracle, SLQ Server, MySQL)
var j = new JDBCProbe("ServiceNow MID Server_MID Server DEV");
j.setDriver("com.microsoft.sqlserver.jdbc.SQLServerDriver");
j.setConnectionString("jdbc:sqlserver://<nomedoserver>;user=ServiceNow;password=ServiceNow");
j.setTable("SAE.TB_SERVICENOW_DADOS");
j.setFunction("select");
j.setWhereClause("CLIENTE_SEGMENTO<>'TLS'");
j.create();
var ds = new GlideRecord("sys_data_source");   
       ds.addQuery('name', gs.getProperty('xxx.yyyy.data_source_name'));   
      ds.query();
var mid = new GlideRecord("ecc_agent");   
   mid.addQuery('name', gs.getProperty('xxx.yyyy.mid_server_name'));   
   mid.query();   
   if (mid.next()) {   
       // Get a specific Data Source (predefined to connect to database)   
       var ds = new GlideRecord("sys_data_source");   
       ds.addQuery('name', gs.getProperty('xxx.yyyy.data_source_name'));   
       ds.query();   
       if (ds.next()) {   
           //Create a JDBC Probe to Insert record in to 
           var sqlInsert = new JDBCProbe(mid.name);   
           sqlInsert.setDataSource(ds.sys_id);   
           sqlInsert.setFunction("INSERT");   
           sqlInsert.setTable(gs.getProperty('xxx.yyyy.db_table_name'));   
           sqlInsert.addParameter("skip_sensor","true");   
           sqlInsert.addField("xxServiceNowId", current.number);   
           ...
           sqlInsert.addField("xxSubmittedBy", current.sys_created_by);
           sqlInsert.addField("xxSubmittedDate", current.opened_at);
           sqlInsert.addField("xxCompletedDate", current.closed_at);
           sqlInsert.create();
       } else {
           throw "Unable to retrieve Data Source details.";
       }
   } else {
       throw "Unable to retrieve MID Server details.";
   }
} catch (err) {
   gs.logError("Workflow: Workflow Name: JDBC Probe to Update Database: caught error: " + err, "+++ Logging");
}
________________________________________
Somatória campo Currency
    var now =new GlideDate();
    var allCostPrev = 0;
    var allCostFat = 0;
    var getPrevisto = new GlideAggregate('tsp1_demand');
    getPrevisto.addEncodedQuery('u_cmdb_product_model.u_product_family=dbd90326db88fbc098601c61149619e4^u_segmento!=ATACADO^u_dt_planejada_pmONThismonth@javascript:gs.beginningOfThisMonth()@javascript:gs.endOfThisMonth()^u_technical_forecast_dateONThis month@javascript:gs.beginningOfThisMonth()@javascript:gs.endOfThisMonth()^u_consider_rfb=true');
    getPrevisto.addAggregate('SUM','u_delta_recorrente');
    getPrevisto.setGroup(false);
    getPrevisto.query();
    while (getPrevisto.next()) {
        allCostPrev = getPrevisto.getAggregate('SUM','u_delta_recorrente');
        //gs.info('TOTAL PREVISTO:'+allCostPrev);
    }
________________________________________
Script Include para calculo de data
var CalculaDtVenc = Class.create();
CalculaDtVenc.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    Calc: function() {
        var dtContratacao = this.getParameter('sysparm_dtcont');
        var prazo = this.getParameter('sysparm_prazo');
        var result = [];
        var dtVencimento = new GlideDateTime(dtContratacao.toString());
            dtVencimento.addDaysLocalTime(prazo);
        result.push(dtVencimento.getDate().getByFormat('yyyy-MM-dd'));
        return JSON.stringify(result);
    },
Client Script
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
var ga = new GlideAjax('x_snc_workflow_cor.CalculaDtVenc');
    ga.addParam('sysparm_name','Calc');
    ga.addParam('sysparm_dtcont',g_form.getValue('u_data_contratacao'));
    ga.addParam('sysparm_prazo',g_form.getValue('u_prazo'));                
   ga.getXMLAnswer(getReturn);
     function getReturn(response) {
        var obj = JSON.parse(response);
        g_form.setValue('u_data_vencimento',obj[0]);
     }
}
________________________________________
Script include com Calculo de período baseado em schedule para considerar apenas DIAS CORRIDOS
var SNCalculateDate = Class.create();
SNCalculateDate.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    Calc: function() {
        //gs.info('TESTE DE CHAMADA');
        var servico = this.getParameter('sysparm_serv');
        var qtd = this.getParameter('sysparm_qtd');
        var today = new GlideDateTime();
        var days;
        var minimo;
        var result=[];
        //gs.info('HOJE: '+today);
        var getDay = new GlideRecord('x_snc_workflow_cor_servi_os');
        getDay.addEncodedQuery('sys_id='+servico);
        getDay.query();
        if(getDay.next()){
            days = getDay.dia;
            minimo = getDay.qtd_minima_servicos;
        }
        var res = days * (qtd / minimo).toFixed(0);
        if(qtd % minimo > 0)
            res += days;
//        gs.info('Resultado: '+res);
        var enddate = new GlideDateTime();
        enddate.addDaysLocalTime(res);
//        gs.info('DATA FIM: '+enddate);
        var dc = new GlideSchedule('08fcd0830a0a0b2600079f56b1adb9ae');
//        dc.setSchedule('08fcd0830a0a0b2600079f56b1adb9ae');
        //put in the sys_id of the schedule in your instance like 8-5 weekdays
        var dur = dc.duration(today,enddate);
//        gs.info('DURACAO: '+dur);
            result.push(enddate.getDate().getByFormat('yyyy-MM-dd'),res,(dur.getNumericValue()/3600000/8).toFixed(0));
        return JSON.stringify(result);
    },
    type: 'SNCalculateDate'
});
________________________________________
Script Include - Filtrar item retornando a query.
var filterItemPxq = Class.create();
filterItemPxq.prototype = {
    filterLPU: function() {
        var seg = current.u_segment;
        var group = current.u_item_group;
        var pxq = current.u_pxq;
        var lpu = [];
        var tLpuPxQ = 'u_m2m_lpus_pxqs';
        var getLPU = new GlideRecord(tLpuPxQ);
        getLPU.addEncodedQuery('u_pxq=' + pxq);
        getLPU.query();
        while (getLPU.next()) {
            lpu.push(getLPU.u_lpu.sys_id);
        }
        var sQuery = 'u_lpuIN' + lpu + '^u_item.u_segment=' + seg + '^u_item.u_item_group=' + group;
        return sQuery;
    },
