//Excluir do formulário variáveis que estão vazias criar uma BR e um Client Script
//-->   BUSINESS RULE
var allVariables = [];
var excludedTypes = '[11][12][19][20][24]';
for(var variable in current.variable_pool){
     var type = '[' + current.variable_pool[variable].getGlideObject().getQuestion().getType() + ']';
     if(excludedTypes.indexOf(type)==-1){
          allVariables.push(variable);
     }
}
g_scratchpad.allIncidentVariables = allVariables.toString();


//-->   CLIENT SCRIPT
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