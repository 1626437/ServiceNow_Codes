//UI Policy para remover os valores dos campos.
function onCondition() {    
    g_form.removeOption('state',2);  //Work in Progress
    g_form.removeOption('state',-5); //On Hold
    g_form.removeOption('state',-3); //Request for Approval
}
//UI Policy para adcionar os valores dos campos.
function onCondition() {
    g_form.removeOption('type','Routine');
    g_form.addOption('type','Comprehensive','Comprehensive');
    g_form.addOption('type','Emergency','Emergency');
    g_form.addOption('type','','');
}