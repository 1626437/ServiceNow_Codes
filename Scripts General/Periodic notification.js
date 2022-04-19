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