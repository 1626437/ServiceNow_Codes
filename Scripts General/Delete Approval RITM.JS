//Cancela Aprovação da RITM depois de X dias pendente de aprovação (BR executada dentro da Tabela sysapproval_approver)
(function executeRule(current, previous /*null when async*/) {
    var idRitm = current.document_id.toString();
    var canceltime = gs.getProperty('glide.ui.request.cancel.time');//Propriedade responsável por armazenar a quantidade de dias
    var pcanceltime = parseInt(canceltime);
    var dataAtual = new GlideDateTime();
    dataAtual.addDays(pcanceltime);
    if (pcanceltime > 0) {
        var nome = "Aprovação automatica " + current.document_id.getDisplayValue() + " - Aprovador: " + current.approver.getDisplayValue();
        var scriptStr = "";
        scriptStr += "\nvar gr = new GlideRecord('sysapproval_approver');";
        scriptStr += "\ngr.addEncodedQuery('state=requested^sysapproval.sys_id=" + idRitm + "');";
        scriptStr += "\ngr.query();";
        scriptStr += "\nif(gr.next()){";
        scriptStr += "\n    gr.state = 'cancelled';";
        scriptStr += "\n    gr.update();";
        scriptStr += "\n}";
        scriptStr += "\n\n";
        scriptStr += "\nvar gr2 = new GlideRecord('sc_req_item');";
        scriptStr += "\ngr2.addEncodedQuery('state=100^sys_id=" + idRitm + "');";
        scriptStr += "\ngr2.query();";
        scriptStr += "\nif(gr2.next()){";
        scriptStr += "\n    gs.eventQueue('request.cancelamento.automatico', gr2, gr2.request.requested_for, gr2.request.requested_for.getDisplayValue());";
        scriptStr += "\n    gr2.state = '16';";
        scriptStr += "\n    gr2.comments = 'Cancelado por falta de aprovação, aprovador: " + current.approver.getDisplayValue() + "';";
        scriptStr += "\n    gr2.update();";
        scriptStr += "\n}";
        var gr = new GlideRecord('sys_trigger');//tabela responsável por implementar programações e executar
        gr.initialize();
        gr.name = nome;
        gr.next_action = dataAtual;
        gr.trigger_type = '0';//Tipo do Item programado executa uma vez
        gr.script = scriptStr;
        gr.insert();
    }

}) (current, previous);