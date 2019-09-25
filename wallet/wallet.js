const bip39 = require('bip39');
const bip32 = require('bip32');
const bitcoin = require('bitcoinjs-lib');
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
			console.log('file aggiornato')
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

exports.generateAddresses = async function () {
	let myaddresses = [];
	let mychangeaddresses = [];
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

exports.prepareTx = function (address, satoshi) {
	// FIXME
	return null;
}

exports.signTx = function (tx) {
	// FIXME
	return null;
}

exports.broadcastTx = function (signedTx) {
	// FIXME
	return null;
}
