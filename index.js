const fs = require('fs');
let config;
let configPath = './config';
if (fs.existsSync()) {
	const config = require(configPath);
} else {
	fs.copyFile('./config.json.template', './config.json', (err) => {
  if (err) throw err;
  	config = require(configPath);
	});
}


const explorer = require('./explorer/explorer');
const wallet = require('./wallet/wallet.js');
const utils = require('./utils');
const inquirer = require("inquirer");
const menu = require('./menu');




function getBalance(addressList) {
	let confirmed = 0;
	let unconfirmed = 0;
	for (i in addressList.addresses) {
		let chain_stats = addressList.addresses[i].chain_stats;
		let mempool_stats = addressList.addresses[i].mempool_stats;

		if(chain_stats && mempool_stats) {
			let confirmed_unspent = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
			let unconfirmed_unspent = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;
			confirmed = confirmed + confirmed_unspent;
			unconfirmed = unconfirmed + unconfirmed_unspent;
		}
	}

	return {confirmed, unconfirmed};
}

function getCurrentAddress(addressList) {
	for (let i in addressList["addresses"]){
		if(!addressList["addresses"][i].chain_stats && !addressList["addresses"][i].mempool_stats) {
			return addressList["addresses"][i].address
		}
	}
}

utils.clear();
utils.printLogo();
utils.printVersion();

async function main() {
	let blockhash = await explorer.getLastBlockHash();
	let blocksheight = await explorer.getLastBlockHeight();
	let addressList = await wallet.generateAddresses();
	let depositAddress = getCurrentAddress(addressList);
	let balance = getBalance(addressList);

	// blockchain info
	utils.printText("network: " + config.network, "red");
	utils.printText("blockchain height: " + blocksheight);
	utils.printText("last block hash: " + blockhash);

	// wallet info
	utils.printText("confirmed balance: " + utils.satoshiToBtc(balance.confirmed),"green");
	utils.printText("unconfirmed balance: " + utils.satoshiToBtc(balance.unconfirmed),"yellow");

	// deposit address
	utils.printText("deposit address: " + depositAddress,"green");
	utils.printQR(depositAddress)

	// menu level 1
	const answer = await inquirer.prompt(menu.questions);
	switch (answer.template) {
		case menu.choices[0]:
			// FIXME
			break;
		case menu.choices[1]:
			utils.clear();
			main();
			break;
		case menu.choices[2]:
			// FIXME
			break;
		case menu.choices[3]:
			utils.clear();
			return;
			break;
		}
}

main()
