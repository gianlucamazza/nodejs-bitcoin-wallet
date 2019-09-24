const http = require('./http');

// last block hash
exports.getLastBlockHeight = async function() {
	return await http.get('blocks/tip/height');
}

// last block hash
exports.getLastBlockHash = async function() {
	return await http.get('blocks/tip/hash');
}

// get address balance
exports.getAddressBalance = async function(address) {
	return await http.get('address/' + address);
}

// get utxo from address
exports.getAddressUtxo = async function(address) {
	return await http.get('address/' + address + '/utxo');
}

// get txs from address
exports.getAddressTxs = async function(address) {
	return await http.get('address/' + address + '/txs');
}
