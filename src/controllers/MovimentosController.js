const connection = require('../database/connection');
require('dotenv/config');

module.exports = {       
    
    async index (request, response) {
        const modalidade = request.body.modalidade;
        const evento = request.body.evento;
        const searchString = request.body.searchString;

        const page = request.body.page;
        const per_page = request.body.per_page;

        let lastPage = 1;

        const movimento = await connection('movimentos').count({count: '*'});
        const countUser = JSON.stringify(movimento[0].count);
        
        console.log('modalidades:',modalidade);
        console.log('evento:',evento);
        console.log('página atual:',page);
        console.log('limite p/ página:',per_page);
        console.log('total de registros:',countUser);

        if (countUser !== 0) {
            lastPage = Math.ceil(countUser / per_page);
            //console.log('última página:',lastPage);
        } else {
            return res.status(400).json({
                mensagem: "Erro: Nenhum usuário encontrado!"
            });
        }

        const offset = Number((page * per_page) - per_page)

        //console.log('offset página:',offset);   
        
        const pagination = {
            page: page,
            per_page: per_page,
            lastPage: lastPage,
            countUser: countUser,
            offset: offset
        }

        if (!modalidade && !evento && !searchString) {
            console.log('pesquisa:',1);
            const movimentos = await connection('movimentos')
            .innerJoin('equipes as times1', 'times1.equId', 'movimentos.movEqu01')
            .innerJoin('equipes as times2', 'times2.equId', 'movimentos.movEqu02')
            .innerJoin('equipes as times3', 'times3.equId', 'movimentos.movEqu03')
            .join('eventos', 'eveId', 'movimentos.movEveId')
            .limit(per_page)
            .offset(offset)    
            .select(['movimentos.*', 'times1.equDescricao As timeA_desc', 'times2.equDescricao As timeB_desc', 'times3.equDescricao As timeC_desc', 'eventos.eveDesc'])
            
            console.log(movimentos);
            
            return response.json({pagination, movimentos});
        } 
                
        //return response.json({servicos});
    },
    
};
