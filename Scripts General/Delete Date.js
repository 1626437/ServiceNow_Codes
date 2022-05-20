//*DELETE*
var user = new GlideRecord('tabela'); 
user.addEncodedQuery('condição'); 
user.setLimit('7000'); // Set limit so the query does not delete more users 
user.query(); 
gs.log('Number of users to be deleted-->'+user.getRowCount()); 
while(user.next()) { 
    user.deleteRecord(); 
} 