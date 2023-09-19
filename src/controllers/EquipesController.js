const connection = require('../database/connection');
require('dotenv/config');

module.exports = {       
    
    async index (request, response) {
        const equipes = await connection('equipes')
        .select('*');
    
        return response.json(equipes);
    },
    
};
