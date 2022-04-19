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

 //***************************************************************************************************************************************
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

//***************************************************************************************************************************************
//Altera o conteúdo do campo para Upper Case
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }  
   var str = newValue.toUpperCase(); 
   if (str != newValue) 
  g_form.setValue('u_contact_name', str); 
}

//***************************************************************************************************************************************
//Preenche Valores na Requested Item na criação
if (current.variables.company != '' && current.variables.company != undefined)
    current.company = current.variables.company;
if (current.variables.comments != '' && current.variables.comments != undefined)
    current.comments = current.variables.comments;
if (current.variables.short_description != '' && current.variables.short_description != undefined)
    current.short_description = current.variables.short_description;
if (current.variables.description != '' && current.variables.description != undefined)
    current.description = current.variables.description;