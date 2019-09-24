const axios = require('axios');
const network = require('./../config').network;
const explorers = require('./explorer.json');

getEndpoint = function () {
		if(network === 'mainnet'){
			return explorers["mainnet"].endpoint
		}
		if(network === 'testnet'){
			return explorers["testnet"].endpoint
		}

}

exports.get = async function(req) {
	try {
		let response = await axios.get(getEndpoint() + req);
		return response.data;
  	} catch (error) {
    		console.error(error)
  	}
}
