const connection = require('../database/connection');
require('dotenv/config');

module.exports = {       
    
    async index (request, response) {
        const eventos = await connection('eventos')
        .select('eveId', 'eveDesc');
    
        return response.json(eventos);
    },
    
};
