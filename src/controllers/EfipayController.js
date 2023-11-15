const connection = require('../database/connection');
require('dotenv/config');
const EfiPay = require('sdk-node-apis-efi')
const options = require('../../credentials')

module.exports = {       
    /*
	async auth (request, response) {
		
		console.log(request.body);

        const id = request.body.lanId; 
        const lancamento = await connection('lancamentos')
        .where('lanId', id)
        .join('usuarios', 'usrId', 'lancamentos.lanUsrId')
        .join('equipes', 'equId', 'lancamentos.lanEquId')
        .select(['lancamentos.*','usuarios.usrNome', 'usuarios.usrCpf', 'equipes.equDescricao']);    
        
        let cpf_cli = lancamento[0].usrCpf;
        let nome_cli = lancamento[0].usrNome;
        let valor_bet = lancamento[0].lanValor.toFixed(2).toString();
		let vlr_cli = valor_bet.replace("," , ".");
        
		//console.log(vlr_cli);
		
        let body = {
	        calendario: {
		    expiracao: 3600,
	    },
	    devedor: {
		    cpf: cpf_cli,
		    nome: nome_cli,
	    },
	    valor: {
		    original: vlr_cli,
	    },
	    chave: 'gilsonfabio@innvento.com.br', // Informe sua chave Pix cadastrada na efipay.	//o campo abaixo é opcional
	        infoAdicionais: [
		        {
			        nome: 'Pagamento em',
			        valor: 'NOME DO SEU ESTABELECIMENTO',
		        },
		        {
			        nome: 'Pedido',
			        valor: 'NUMERO DO PEDIDO DO CLIENTE',
		        },
	        ],
        }

        let params = {
	        txid: 'dt9BHlyzrb5jrFNAdfEDVpHgiOmDbVq111',
        }

        const efipay = new EfiPay(options)

        const res = await efipay.pixCreateImmediateCharge([], body);      //....informar no lugar do [] -> params
	    //console.log(res);
		
		let paramsQRCode = {
			id: res.loc.id
		}
		
		const resp = await efipay.pixGenerateQRCode(paramsQRCode);
		//console.log(resp);
		const dados = resp;
		return response.json(dados);

    },
	*/
	
	async auth (request, response) {
		
		//console.log(request.body);

        const id = request.body.lanUsrId; 

        const lanUsrId = request.body.lanUsrId;
        const lanMovId = request.body.lanMovId; 
        const lanEquId = request.body.lanEquId; 
        const lanValor = request.body.lanValor.replace("," , ".");
        console.log('Valor Original:', request.body.lanValor);
        let valor_bet = parseFloat(lanValor).toFixed(2);
        console.log('Valor Bet:',valor_bet);       
        let vlrAposta = valor_bet.toString().replace("," , ".");
        console.log('Valor Aposta:',vlrAposta);
		let vlr_cli = vlrAposta;
        
        const usuario = await connection('usuarios')
        .where('usrId', id)
        .select('usrNome', 'usrCpf');    
        
        let cpf_cli = usuario[0].usrCpf;
        let nome_cli = usuario[0].usrNome;
               
		console.log('Valor:',vlr_cli);
		
        let body = {
	        calendario: {
		    expiracao: 3600,
	    },
	    devedor: {
		    cpf: cpf_cli,
		    nome: nome_cli,
	    },
	    valor: {
		    original: vlr_cli,
	    },
	    chave: 'gilsonfabio@innvento.com.br', // Informe sua chave Pix cadastrada na efipay.	//o campo abaixo é opcional
	        infoAdicionais: [
		        {
			        nome: 'Pagamento em',
			        valor: 'NOME DO SEU ESTABELECIMENTO',
		        },
		        {
			        nome: 'Pedido',
			        valor: 'NUMERO DO PEDIDO DO CLIENTE',
		        },
	        ],
        }

        //let params = {
	    //    txid: 'dt9BHlyzrb5jrFNAdfEDVpHgiOmDbVq111',
        //}

        const efipay = new EfiPay(options)
        
        const res = await efipay.pixCreateImmediateCharge([], body);

        //console.log(res)
        let txid = res.txid;
        let status = 'P';

        const [lanId] = await connection('lancamentos').insert({
            lanUsrId,
            lanMovId, 
            lanEquId, 
            lanValor,
            lanTxid: txid, 
            lanStatus: status 
        });

        let paramsQRCode = {
            id: res.loc.id
        }
        efipay.pixGenerateQRCode(paramsQRCode)
	    .then((resposta) => {
		    //console.log(resposta)
            const dados = resposta;
            return response.json(dados);
	    })
	    .catch((error) => {
		    console.log(error)
            return response.json(error);
	    })               

        //const res = await efipay.pixCreateImmediateCharge([], body);      //....informar no lugar do [] -> params
        //console.log(response);
    },

	async webhook (request, response) {
		const txid = request.body.txid;
        let status = 'A';
        const updLanc = await connection('lancamentos')
        .where('lanTxid', txid)
        .update({
            lanStatus: status, 
        });

        const regLanc = await connection('lancamentos')
        .where('lanTxid', txid)
        .select('*');
        
        let lanUsrId = regLanc[0].lanUsrId;
        let lanMovId = regLanc[0].lanMovId; 
        let lanEquId = regLanc[0].lanEquId; 
        let lanValor = regLanc[0].lanValor;

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
		
    },

};