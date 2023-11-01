const connection = require('../database/connection');
require('dotenv/config');
const EfiPay = require('sdk-node-apis-efi')
const options = require('../../credentials')

module.exports = {       
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
};