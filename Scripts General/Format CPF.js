//********************************************** */
//      Formatar CPF onChange Client Script
//********************************************* */
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