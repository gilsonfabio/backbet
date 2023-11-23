const fs = require('fs')
const path = require('path')

//const cert = path.resolve(__dirname, `src/certs/${process.env.EFIPAY_CERTIFICATE}`);

let cert = Buffer.from(process.env.EFIPAY_CERTIFICATE, 'base64')

console.log(cert);

module.exports = {
	// PRODUÇÃO = false
	// HOMOLOGAÇÃO = true
	sandbox: process.env.EFIPAY_SANDBOX,
	client_id: process.env.EFIPAY_CLIENT_ID,
	client_secret: process.env.EFIPAY_CLIENT_SECRET,
	certificate: cert,
	cert_base64: true,
}