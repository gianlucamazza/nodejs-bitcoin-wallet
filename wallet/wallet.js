const bip39 = require('bip39');
const bip32 = require('bip32');
const bitcoin = require('bitcoinjs-lib');
const coinselect = require('coinselect');
const explorer = require('./../explorer/explorer');
const network = require('./../config.json').network;
const fs = require('fs');

let getNetwork = function () {
	if (network === 'mainnet') {
			return bitcoin.networks.mainnet;
	}
	if (network === 'testnet') {
			return bitcoin.networks.testnet;
	}
}

getPath = function () {
	return config.derivationPath;
}

exports.generateMnemonic = function () {
	return bip39.generateMnemonic();
}

function validateMnemonic (mnemonic) {
	return bip39.validateMnemonic(mnemonic);
}

function updateConfig (mnemonic) {
	let fileName = 'config.json';
	let config = require('./../config.json');
	config.mnemonic = mnemonic;
		fs.writeFileSync(fileName, JSON.stringify(config), 'utf8', (err) => {
			if (err) {
				console.log(err)
				return false;
			}
			return true;
		});
}

function readMnemonic () {
	let mnemonic = require('./../config.json').mnemonic;
	if(validateMnemonic(mnemonic)) {
		return mnemonic;
	} else {
		mnemonic = bip39.generateMnemonic();
		let res = updateConfig(mnemonic);
		return mnemonic
	}
}

let seed;
function mnemonicToSeedSync () {
	if(seed) return seed;
	seed = bip39.mnemonicToSeedSync(readMnemonic());
	return seed;
}

let node;
function getNode () {
	if(node) return node;
	node = bip32.fromSeed(mnemonicToSeedSync(), getNetwork());
	return node;
}

function derivePath (index, isChange) {
	return getNode().deriveHardened(0).derive(isChange ? 1 : 0).derive(index);
}

function getAddress (child) {
	let network = getNetwork();
	let pubkey = child.publicKey;
	return bitcoin.payments.p2wpkh({ pubkey: pubkey, network }).address;
}

async function isUsed (address) {
	let balance = await explorer.getAddressBalance(address);
	if(balance.chain_stats.tx_count > 0 || balance.mempool_stats.tx_count > 0) {
		return balance;
	} else {
		return false;
	}
}

exports.refresh = async function () {
	myaddresses = [];
	mychangeaddresses = [];

	await this.generateAddresses();
}

let myaddresses = [];
let mychangeaddresses = [];
exports.generateAddresses = async function () {
	let index = 0;
	let chindex = 0;
	let generateAddressList = async function (index, isChange) {
		let child = derivePath(index, isChange);
		let address = getAddress(child);
		let addressBalance = await isUsed(address);
		if (addressBalance) {
			if(!isChange) myaddresses.push(addressBalance);
			else mychangeaddresses.push(addressBalance);
			index = index + 1;
			await generateAddressList(index);
		} else {
			let obj = {'address': address}
			if(!isChange) myaddresses.push(obj);
			else mychangeaddresses.push(obj);
		}
	}
	await generateAddressList(index, false);
	await generateAddressList(chindex, true);

	return { "addresses": myaddresses, "change_addresses": mychangeaddresses }
}

exports.getAddresses = function () {
	return myaddresses;
}

exports.getChangeAddresses = function () {
	return mychangeaddresses;
}

exports.getCurrentAddress = async function () {
	if(myaddresses.length === 0) await this.generateAddresses()
	for (let i in myaddresses){
		if(!myaddresses[i].chain_stats && !myaddresses[i].mempool_stats) {
			return myaddresses[i].address
		}
	}
}

exports.getCurrentChangeAddress = function () {
	for (let i in mychangeaddresses){
		if(!mychangeaddresses[i].chain_stats && !mychangeaddresses[i].mempool_stats) {
			return mychangeaddresses[i].address
		}
	}
}

exports.getBalance = function () {
	let confirmed = 0;
	let unconfirmed = 0;
	for (i in myaddresses) {
		let chain_stats = myaddresses[i].chain_stats;
		let mempool_stats = myaddresses[i].mempool_stats;

		if(chain_stats && mempool_stats) {
			let confirmed_unspent = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
			let unconfirmed_unspent = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;
			confirmed = confirmed + confirmed_unspent;
			unconfirmed = unconfirmed + unconfirmed_unspent;
		}
	}
	for (i in mychangeaddresses) {
		let chain_stats = mychangeaddresses[i].chain_stats;
		let mempool_stats = mychangeaddresses[i].mempool_stats;

		if(chain_stats && mempool_stats) {
			let confirmed_unspent = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
			let unconfirmed_unspent = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;
			confirmed = confirmed + confirmed_unspent;
			unconfirmed = unconfirmed + unconfirmed_unspent;
		}
	}

	return {confirmed, unconfirmed};
}

exports.prepareTx = async function (myaddresses, destination, satoshi, feeRate) {

	function hasUTXO(obj) {
		if(obj.chain_stats || obj.mempool_stats) {
			return true;
		} else {
			return false;
		}
	}

	function addressBalance(input) {
		let confirmed = input.chain_stats.funded_txo_sum - input.chain_stats.spent_txo_sum;
		let unconfirmed = input.mempool_stats.funded_txo_sum - input.mempool_stats.spent_txo_sum;
		let total = confirmed + unconfirmed;
		return total;
	}

	function getUTXO(addresses) {
		let utxo = [];
		for(let i = 0; i < addresses.length; i++) {
			for(let k = 0; k < addresses[i].txs.length; k++){
				let t = {
					"txId": addresses[i].txs[k].txid,
					"vout": k,
					"value": addressBalance(addresses[i])
				}
				utxo.push(t)
			}
		}

		return utxo;
	}

	let addresses = myaddresses.filter(hasUTXO)
	for(let i = 0; i < addresses.length; i++) {
		addresses[i].txs = await explorer.getAddressTxs(addresses[i].address);
	}

	let utxo = getUTXO(addresses);

	let targets = [{
		"address": destination,
		"value": parseFloat(satoshi) * 100000000
	}]
	let { inputs, outputs, fee } = coinselect(utxo, targets, feeRate)

	if (!inputs || !outputs) return

	const psbt = new bitcoin.Psbt({ network: network });

	inputs.forEach(input => psbt.addInput(
		{
			"hash": input.txId,
			"index": input.vout
		}
	))
	outputs.forEach(output => {
		if (!output.address) {
    	output.address = this.getCurrentChangeAddress()
		}
		psbt.addOutput({
			"script": Buffer.from(output.address, 'hex'),
			"value": output.value
		})
	})
	console.log(psbt.extractTransaction().toHex())

	return psbt;
}

exports.signTx = function (tx) {
	// FIXME
	return null;
}

exports.broadcastTx = function (signedTx) {
	// FIXME
	return null;
}
