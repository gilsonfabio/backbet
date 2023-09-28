const connection = require('../database/connection');
require('dotenv/config');

module.exports = {       
    
    async newBet(request, response) {
        const lanUsrId = request.body.lanUsrId;
        const lanMovId = request.body.lanMovId; 
        const lanEquId = request.body.lanEquId; 
        const lanValor = parseInt(request.body.lanValor); 
        const lanStatus = 'A' 

        const [lanId] = await connection('lancamentos').insert({
            lanUsrId,
            lanMovId, 
            lanEquId, 
            lanValor, 
            lanStatus 
        });

        const modal = await connection('equipes')
        .where('equId', lanEquId)
        .join('modalidades', 'modId', 'equipes.equModId')
        .select(['equipes.*','modalidades.modPercentual']);

        let taxa = parseInt(modal[0].modPercentual);  
        let vlrTaxa = ((lanValor * taxa) / 100).toFixed(2);
        let betValor = lanValor - vlrTaxa;

        const movim = await connection('movimentos')
            .where('movId', lanMovId)
            .select('*');
            

            let auxEqu01 = movim[0].movEqu01;  
            let auxPayout01 = parseInt(movim[0].movPayout01); 
            let auxVlrPay01 = movim[0].movVlrPay01; 
            let auxEqu02 = movim[0].movEqu02;  
            let auxPayout02 = parseInt(movim[0].movPayout02); 
            let auxVlrPay02 = movim[0].movVlrPay02;  
            let auxEqu03 = movim[0].movEqu03;  
            let auxPayout03 = parseInt(movim[0].movPayout03); 
            let auxVlrPay03 = movim[0].movVlrPay03;   
            let auxVlrTotal = movim[0].movVlrTotal; 
            let auxVlrReal = movim[0].movVlrBet; 
            
            let betVlrTotal = auxVlrTotal + lanValor;
            let betVlrReal = auxVlrReal + betValor;
            
            let betPayout01 = 0.00;
            let betVlrPay01 = 0.00;
            let betPayout02 = 0.00;
            let betVlrPay02 = 0.00;
            let betPayout03 = 0.00;
            let betVlrPay03 = 0.00;

            console.log('Achou equipe:', lanEquId, ' -> ', auxEqu01, auxEqu02, auxEqu03)

            if (lanEquId == auxEqu01) {                
                betVlrPay01 = auxVlrPay01 + betValor;
                betPayout01 = (betVlrReal / betVlrPay01).toFixed(2);
                betVlrPay02 = auxVlrPay02;
                betPayout02 = (betVlrReal / betVlrPay02).toFixed(2);
                betVlrPay03 = auxVlrPay03;
                betPayout03 = (betVlrReal / betVlrPay03).toFixed(2);
            }else {
                if (lanEquId == auxEqu02) {
                    betVlrPay02 = auxVlrPay02 + betValor;
                    betPayout02 = (betVlrReal / betVlrPay02).toFixed(2);
                    betVlrPay01 = auxVlrPay01;
                    betPayout01 = (betVlrReal / betVlrPay01).toFixed(2);
                    betVlrPay03 = auxVlrPay03;
                    betPayout03 = (betVlrReal / betVlrPay03).toFixed(2);
                }else { 
                    if (lanEquId == auxEqu03) {
                        betVlrPay03 = auxVlrPay03 + betValor;
                        betPayout03 = (betVlrReal / betVlrPay03).toFixed(2);
                        betVlrPay02 = auxVlrPay02;
                        betPayout02 = (betVlrReal / betVlrPay02).toFixed(2);
                        betVlrPay01 = auxVlrPay01;
                        betPayout01 = (betVlrReal / betVlrPay01).toFixed(2);
                    }
                }
            }

            console.log(auxEqu01, betVlrPay01, betPayout01 );
            console.log(auxEqu02, betVlrPay02, betPayout02 );
            console.log(auxEqu03, betVlrPay03, betPayout03 );
            console.log(betVlrTotal, betVlrReal );
                    
            const updMovim = await connection('movimentos')
            .where('movId', lanMovId)
            .update({
                movPayout01: betPayout01,
                movVlrPay01: betVlrPay01,
                movPayout02: betPayout02,
                movVlrPay02: betVlrPay02,
                movPayout03: betPayout03,
                movVlrPay03: betVlrPay03,
                movVlrTotal: betVlrTotal,
                movVlrBet: betVlrReal,
            });

        return response.json(movim);
         
                
        //return response.json({servicos});
    },
    
};
