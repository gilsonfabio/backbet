const fs = require('fs')
const path = require('path')

const cert = fs.readFileSync(
    path.resolve(__dirname, `src/certs/${process.env.EFIPAY_PATH_CERTIFICATE}`)	
);

module.exports = {
	// PRODUÇÃO = false
	// HOMOLOGAÇÃO = true
	sandbox: process.env.EFIPAY_SANDBOX,
	client_id: process.env.EFIPAY_CLIENT_ID,
	client_secret: process.env.EFIPAY_CLIENT_SECRET,
	certificate: cert, 
}