//Definir um grupo de designação no workflow
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