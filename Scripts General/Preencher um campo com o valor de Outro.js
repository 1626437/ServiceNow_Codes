function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
       return;
    }
     var uf = g_form.getReference('u_municipio_ponta_a');
     //ele acessa a referencia e obtem qualquer campo relacionado a ele
     g_form.setValue('u_uf_municipio_a', uf.u_uf_municipio.toString());
    
 }