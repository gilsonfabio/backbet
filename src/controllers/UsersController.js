const connection = require('../database/connection');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
require('dotenv/config');

const jwt = require('jsonwebtoken');
const {v4:uuidv4} = require ('uuid') ; 

module.exports = {       
    
    async signIn(request, response) {
        let email = request.body.email;
        let senha = request.body.password;

        console.log('Email:', email)

        const dados = await connection('usuarios')
            .where('usrEmail', email)
            .select('usrId', 'usrNome', 'usrEmail')
            .first();
         
        if (!dados) {
            return response.status(400).json({ error: 'Não encontrou usuário com este ID'});
        } 

        const user = {
            id: dados.usrId,
            name: dados.usrNome,
            email: dados.usrEmail
        }

        /*

        console.log(senha)
        let pass = user.usrPassword;
        console.log(pass) 
        const match = await bcrypt.compare(senha, pass)
        
        console.log(match)

        if(!match) {
            console.log('Erro Password!')
            return response.status(403).send({ auth: false, message: 'User invalid!' });
        }
        
        const dados = {
            usrId: user.usrId,
            usrNome: user.usrNome,
            usrNivAcesso: user.usrNivAcesso
        }

        let token = jwt.sign({ id: user.usrId, name: user.usrNome, email: user.usrEmail, nivel: user.usrNivAcesso }, process.env.SECRET_JWT, {
            expiresIn: '1h'
        });
        let refreshToken = jwt.sign({ id: user.usrId, name: user.usrNome, email: user.usrEmail, nivel: user.usrNivAcesso  }, process.env.SECRET_JWT_REFRESH, {
            expiresIn: '2h'
        });

        */

        console.log(user)

        return response.json(user);

    },
    
    async index (request, response) {
        const users = await connection('usuarios')
        .orderBy('usrNome')
        .select('usrId', 'usrNome', 'usrNivAcesso', 'usrEmail');
    
        return response.json(users);
    }, 

    async create(request, response) {
        //console.log(request.body);

        const {usrNomUsr, usrNome, usrCpf, usrEmail, usrCelular, usrTimTorce, usrPraEsporte, usrEsporte, usrPassword, usrChvPix} = request.body;
        let status = 'A'; 
        let snhCrypt = await bcrypt.hash(usrPassword, saltRounds);

        const [usrId] = await connection('usuarios').insert({
            usrNomUsr, 
            usrNome, 
            usrCpf, 
            usrEmail, 
            usrCelular, 
            usrTimTorce, 
            usrPraEsporte, 
            usrEsporte, 
            usrPassword: snhCrypt, 
            usrChvPix,
            usrStatus: status
        });
           
        return response.json({usrId});
    },
    
    async refreshToken(request, response) {
        let id = request.body.idUsr;
    
        const user = await connection('usuarios')
            .where('usrId', id)
            .select('usrId', 'usrNome', 'usrEmail', 'usrNivAcesso')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou usuário com este ID'});
        } 

        let token = jwt.sign({ id: user.usrId, name: user.usrNome, email: user.usrEmail, nivel: user.usrNivAcesso }, process.env.SECRET_JWT, {
            expiresIn: process.env.EXPIREIN_JWT
        });
        let refreshToken = jwt.sign({ id: user.usrId, name: user.usrNome, email: user.usrEmail, nivel: user.usrNivAcesso  }, process.env.SECRET_JWT_REFRESH, {
            expiresIn: process.env.EXPIREIN_JWT_REFRESH
        });

        return response.json({user, token, refreshToken});

    },

    //...........................................................................................................................

    async dadUsuario (request, response) {        
        let id = request.params.user;
        const usuario = await connection('usuarios')
        .where('usrId', id)
        .select('*');

        return response.json(usuario);
    },

    async updUsuario(request, response) {
        let id = request.params.idUsr;         
        const {usrNomUsr, usrNome, usrCpf, usrEmail, usrCelular, usrTimTorce, usrPraEsporte, usrEsporte, usrChvPix} = request.body;
 
        await connection('usuarios').where('usrId', id)   
        .update({
            usrNomUsr, 
            usrNome, 
            usrCpf, 
            usrEmail, 
            usrCelular, 
            usrTimTorce, 
            usrPraEsporte, 
            usrEsporte, 
            usrChvPix,        
        });
           
        return response.status(204).send();
    },

    async updAdmPassword(request, response) {
      
        const { email, password, codSeguranca } = request.body;

        let snhCrypt = await bcrypt.hash(password, saltRounds);
        let segLimpa = '';
        await connection('usuarios')
        .where('usrEmail', email) 
        .where('usrCodSeguranca', codSeguranca)   
        .update({
            usrPassword: snhCrypt,
            usrCodSeguranca: segLimpa,           
        });
           
        return response.status(204).send({ auth: false, message: 'User atualizado!' });
    },

};
