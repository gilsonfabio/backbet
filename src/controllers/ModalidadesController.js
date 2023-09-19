const connection = require('../database/connection');
require('dotenv/config');

module.exports = {       
    
    async index (request, response) {
        const modalidades = await connection('modalidades')
        .select('*');
    
        return response.json(modalidades);
    },
    
};
