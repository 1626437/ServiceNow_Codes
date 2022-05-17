/*****************************************************************
         Scheduled.Envio de Eventos para Sistema Externo
 *****************************************************************/

         var log = {};

         //Propriedades para obter os filtros e campos
         var filter = JSON.parse(gs.getProperty("query.table"));
         var field = JSON.parse(gs.getProperty("fields.table"));
         
         var dataset = new Create_and_Set_Payload();
         
         //Query que faz uma consulta junto com a tabela notas de Fechamentos, para diminuir a quantidade de registros
         var gr = new GlideRecord('u_ttm');
         gr.addEncodedQuery(filter.u_ttm);
         gr.orderByDesc('sys_updated_on');
         gr.query();
         while (gr.next()) {
         
             //Criação do Payload
             log = dataset.consultTableFields('u_ttm', filter.all + gr.getUniqueValue(), field.u_ttm, false);
             log.id_servico = dataset.consultTableFieldValue('u_rede_dinamic_trail', filter.u_rede_dinamic_trail + gr.getUniqueValue(), 'u_id');
             log.notas_de_fechamentos = dataset.consultTableFields('u_notas_de_fechamento_de_tasks', filter.u_notas_de_fechamento_de_tasks + gr.getUniqueValue(), field.u_notas_de_fechamento_de_tasks, true, 'u_task.closed_at');
         
             gs.info('Payload:' + JSON.stringify(log));
             var aux = dataset.setRestMessage('Sistem Externo', 'Metodo', 'POST', JSON.stringify(log));
         
             //Valida envio do Evento
             if (aux)
                 gs.info('Integração efetuada com sucesso!');
             else
                 gs.info('Integração não efetuada com sucesso!');
             
         }