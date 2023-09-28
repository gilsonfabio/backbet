const express = require('express');

const routes = express.Router();

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

routes.get('/modalidades', ModalidadesController.index);

routes.get('/eventos', EventosController.index);

routes.get('/equipes', EquipesController.index);

routes.post('/movimentos', MovimentosController.index);
routes.get('/busMovim/:idMov', MovimentosController.busMovim);

routes.post('/newbet', LancamentosController.newBet);


routes.post('/servicos', ServicesController.index);
routes.post('/newservicos', ServicesController.create);

module.exports = routes;
