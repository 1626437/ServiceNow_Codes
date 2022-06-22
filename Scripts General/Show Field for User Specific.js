//Necessário criar um client script com o tipo onload e inseri o script abaixo

function onLoad() {
    //O campo só irá apresentar se o usuário que está visualizando o registro possuir a hole passada
     user = g_user.hasRole('change_manager');
     if(user)
         g_form.setDisplay('on_hold',true);
     else
         g_form.setDisplay('on_hold',false);
 }