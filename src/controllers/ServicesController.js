const connection = require('../database/connection');
require('dotenv/config');

module.exports = {       
    
    async index (request, response) {
        //const {modalidade, tipo, searchString, page, per_page} = request.body;
        
        console.log(request.body);

        const modalidade = request.body.modalidade;
        const tipo = request.body.tipo;
        const searchString = request.body.searchString;

        const page = request.body.page;
        const per_page = request.body.per_page;

        let lastPage = 1;

        const servico = await connection('servicos').count({count: '*'});
        const countUser = JSON.stringify(servico[0].count);
        
        console.log('modalidades:',modalidade);
        console.log('tipos:',tipo);
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

        if (!modalidade && !tipo && !searchString) {
            console.log('pesquisa:',1);
            const servicos = await connection('servicos')
            .join('secretarias', 'secId', 'servicos.srvSecId')
            .limit(per_page)
            .offset(offset)            
            .select(['servicos.*', 'secretarias.secDescricao'])
            return response.json({pagination, servicos});
        } else {
            if (modalidade && !tipo && !searchString) {
                console.log('pesquisa:',2);
                const servicos = await connection('servicos')
                .whereIn('srvMsvId', modalidade)
                .limit(per_page)
                .offset(offset)
                .join('secretarias', 'secId', 'servicos.srvSecId')
                .select(['servicos.*', 'secretarias.secDescricao'])
                return response.json({pagination, servicos});
            } else {
                if (!modalidade && tipo && !searchString) {
                    console.log('pesquisa:',3);
                    const servicos = await connection('servicos')
                    .whereIn('srvTsvId', tipo)
                    .limit(per_page)
                    .offset(offset)
                    .join('secretarias', 'secId', 'servicos.srvSecId')
                    .select(['servicos.*', 'secretarias.secDescricao'])
                    return response.json({pagination, servicos});
                } else {
                    if (!modalidade && !tipo && searchString) {
                        console.log('pesquisa:',4);
                        const servicos = await connection('servicos')                        
                        .where('srvObjetivo', 'like', `%${searchString.replaceAll('%', '\\%')}%`)
                        .limit(per_page)
                        .offset(offset)
                        .join('secretarias', 'secId', 'servicos.srvSecId')
                        .select(['servicos.*', 'secretarias.secDescricao'])
                        return response.json({pagination, servicos});
                    } else {
                        if (modalidade && !tipo && searchString) {
                            console.log('pesquisa:',5);
                            const servicos = await connection('servicos')
                            .whereIn('srvMsvId', modalidade)
                            .where('srvObjetivo', 'like', `%${searchString.replaceAll('%', '\\%')}%`)
                            .limit(per_page)
                            .offset(offset)
                            .join('secretarias', 'secId', 'servicos.srvSecId')
                            .select(['servicos.*', 'secretarias.secDescricao'])
                            return response.json({pagination, servicos});
                        } else {
                            if (modalidade && tipo && searchString) {
                                console.log('pesquisa:',6);
                                const servicos = await connection('servicos')                                
                                .whereIn('srvMsvId', modalidade)
                                .whereIn('srvTsvId', tipo)
                                .where('srvObjetivo', 'like', `%${searchString.replaceAll('%', '\\%')}%`)
                                .limit(per_page)
                                .offset(offset)
                                .join('secretarias', 'secId', 'servicos.srvSecId')
                                .select(['servicos.*', 'secretarias.secDescricao'])
                                return response.json({pagination, servicos});
                            } else {
                                if (!modalidade && !tipo && searchString) {
                                    console.log('pesquisa:',7);
                                    const servicos = await connection('servicos')
                                    .where('srvObjetivo', 'like', `%${searchString.replaceAll('%', '\\%')}%`)
                                    .limit(per_page)
                                    .offset(offset)
                                    .join('secretarias', 'secId', 'servicos.srvSecId')
                                    .select(['servicos.*', 'secretarias.secDescricao'])
                                    return response.json({pagination, servicos});
                                } else {
                                    if (!modalidade && tipo && searchString) {
                                        console.log('pesquisa:',8);
                                        const servicos = await connection('servicos')                                        
                                        .whereIn('srvTsvId', tipo)
                                        .where('srvObjetivo', 'like', `%${searchString.replaceAll('%', '\\%')}%`)
                                        .limit(per_page)
                                        .offset(offset)
                                        .join('secretarias', 'secId', 'servicos.srvSecId')
                                        .select(['servicos.*', 'secretarias.secDescricao'])
                                        return response.json({pagination, servicos});
                                    } else {
                                        if (!modalidade && !tipo && !searchString) {
                                            console.log('pesquisa:',9);
                                            const servicos = await connection('servicos')
                                            .limit(per_page)
                                            .offset(offset)
                                            .join('secretarias', 'secId', 'servicos.srvSecId')
                                            .select(['servicos.*', 'secretarias.secDescricao'])
                                            return response.json({pagination, servicos});
                                        }
                                    }
                                }    
                            }    
                        }
                    }
                }   
            } 
        }    
         
        //return response.json({servicos});

    },
    
    async create(request, response) {
        const { srvMsvId, srvTsvId, srvDescricao, srvSecId, srvObjetivo, srvInformacao, srvLink} = request.body;
        var status = 'A'; 
        const [srvId] = await connection('servicos').insert({
            srvMsvId, 
            srvTsvId, 
            srvDescricao, 
            srvSecId, 
            srvObjetivo, 
            srvInformacao, 
            srvLink, 
            srvStatus: status
        });
           
        return response.json({srvId});
    },

};
