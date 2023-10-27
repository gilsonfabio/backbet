const express = require('express');
const jwt = require('jsonwebtoken');

const routes = express.Router();

const UsersController = require('./controllers/UsersController');
const ModalidadesController = require('./controllers/ModalidadesController');
const EventosController = require('./controllers/EventosController');
const EquipesController = require('./controllers/EquipesController');
const ServicesController = require('./controllers/ServicesController');
const MovimentosController = require('./controllers/MovimentosController');
const LancamentosController = require('./controllers/LancamentosController');

routes.get('/', (request, response) => {
    response.json({
        message: 'Bem-vindo ao servidor Serviços!',
    });
});

function verifyJWT(req, res, next){
    //console.log('verificando token...')
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.'});

    jwt.verify(token, process.env.SECRET_JWT, (err, userInfo) => {
        if (err) {
           return res.status(403).send({ auth: false, message: 'Token invalid!'});
        }                
        next();            
    });
}

async function verifyRefreshJWT(req, res, next){
    //console.log('verificando refresh token...')
    const refreshTokenJWT = req.headers["x-access-token"];
    if (!refreshTokenJWT) return res.status(401).send({ auth: false, message: 'No refresh token provided.' });
    
    jwt.verify(refreshTokenJWT, process.env.SECRET_JWT_REFRESH, (err, userInfo) => {
        if (err) {
           return res.status(403).send({ auth: false, message: 'Refresh Token invalid!' });
        }
        next();            
    });
}

routes.post('/refreshToken', verifyRefreshJWT, UsersController.refreshToken);

routes.post('/signIn', UsersController.signIn);
routes.get('/users', verifyJWT, UsersController.index);
routes.post('/newuser', verifyJWT, UsersController.create);

routes.get('/modalidades', ModalidadesController.index);

routes.get('/eventos', EventosController.index);

routes.get('/equipes', EquipesController.index);

routes.post('/movimentos', MovimentosController.index);
routes.get('/busMovim/:idMov', MovimentosController.busMovim);

routes.post('/newbet', LancamentosController.newBet);


routes.post('/servicos', ServicesController.index);
routes.post('/newservicos', ServicesController.create);

module.exports = routes;
