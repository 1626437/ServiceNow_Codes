//Esconder as TABs de acordo com algum outro valor em algum campo
function onChange(control, oldValue, newValue, isLoading) {
    var sections = g_form.getSections();
    if (newValue == '6'||newValue == '7') {
         sections[3].style.display = 'block';
    } else {
         sections[3].style.display = 'none';
    }
}