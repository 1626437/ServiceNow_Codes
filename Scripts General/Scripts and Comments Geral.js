//***************************************************************************************************************************************
//Cria uma lista com os valores de um campo do formulário, nesse caso o cano ic é usado para criar uma lista com suas áreas impactadas.
var impactedArea = new impactedArea();
current.u_impacted_areas = impactedArea.getimpactedArea(current.cmdb_ci);
current.update();
gs.addInfoMessage(gs.getMessage('Impacted Areas Updated'));
action.setRedirectURL(current); 
//***************************************************************************************************************************************
/*Evidencia usuário VIP 
Personalize Style(botão direita label)
TABLE: <tablename>
FIELD: <caller>
VALUE: javascript:current.caller_id.vip == true
STYLE
background-image: url('images/icons/vip.gif');
background-repeat: no-repeat;
background-position: 98% 5px;
padding-right: 30px;
***************************************************************************************************************************************/
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

//***************************************************************************************************************************************
//Para pegar a ClassName da tabela task
current.getRecordClassName() == 'incident' || current.getRecordClassName() == 'problem'

//***************************************************************************************************************************************
//SCRIPT INCLUDE para filtrar um campo reference através de um campo choice associado a mesma tabela do reference.
function filterSublocation(){
     return 'u_macro_location=‘(campo usado para referenciar através do) + current.u_location;
}
//***************************************************************************************************************************************
//Preenche empresa e comentários para um requested item. Business Rule executando em insert na tabela sc_req_item
if (current.variables.company != '' && current.variables.company != undefined)
current.company = current.variables.company;
if (current.variables.comments != '' && current.variables.comments != undefined)
current.comments = current.variables.comments;
if (current.variables.short_description != '' && current.variables.short_description != undefined)
current.short_description = current.variables.short_description;
if (current.variables.description != '' && current.variables.description != undefined)
current.description = current.variables.description;
//***************************************************************************************************************************************
//Deleção em massa através de background script.
var gr = new GlideRecord('cmdb_ci');
gr.addQuery(’sys_class_name', 'cmdb_ci');
gr.query();
gr.deleteMultiple();

//***************************************************************************************************************************************
//Chamar um mail script na notificação
${mail_script:sapReplyTo}
${mail_script:attach_links}
//***************************************************************************************************************************************
//Filtra Grupos em Fluxos
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

//***************************************************************************************************************************************
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
//***************************************************************************************************
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
//***********************************************************************************************************************
//Atualização de múltiplos registros através de Scripts - Background

//*UPDATE*
var updateCI = new GlideRecord('task');
updateCI.addEncodedQuery('sys_class_name=sc_request');
updateCI.query();
while(updateCI.next()){
updateCI.sys_domain='atualização';
updateCI.setForceUpdate(true);
updateCI.setWorkflow(false);
updateCI.update();
}

//*DELETE*
var user = new GlideRecord('tabela'); 
user.addEncodedQuery('condição'); 
user.setLimit('7000'); // Set limit so the query does not delete more users 
user.query(); 
gs.log('Number of users to be deleted-->'+user.getRowCount()); 
while(user.next()) { 
    user.deleteRecord(); 
} 
//***********************************************************************************************************************
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
//***********************************************************************************************************************
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
//***********************************************************************************************************************
//Desabilitar Protection Policy de Read only para None
var gr = new GlideRecord("sys_metadata"); 
gr.get("d1ea2bf1cb200200d71cb9c0c24c9c15"); 
gs.print(gr.sys_policy); 
gr.sys_policy=""; 
gs.print(gr.sys_policy); 
gr.update();
//***********************************************************************************************************************
//Limpa variáveis do Variable Editor.
//•   Pegar o ID da variável no console
//•   Inserir o ID na função gel.
var recordID = gel('variable_ni.QS7771b1c63720e2006929008993990ec2');
recordID.style.display='none';
//***********************************************************************************************************************
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
/*Estagios de um Process Flow
1. Create process flow formatter for incident table with following stages:
   - Stage should be "Incident Identification and Categorization" when state is New
   - Stage should be "Investigation and Diagnosis" when state is Active, Awaiting User Info or Awaiting Problem.
   - Stage should be "Resolution" when state is Awaiting Change or Resolved.
   - Stage should be "Closure" when state is Closed.
***********************************************************************************************************************
Usando o getClientData para pegar valores inseridos através de um server script. Nesse exemplo coletando o idioma através da BR.
_*/
_______________________________________
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
