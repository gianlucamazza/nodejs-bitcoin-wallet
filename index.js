const explorer = require('./explorer/explorer');
const wallet = require('./wallet/wallet.js');
const config = require('./config');
const utils = require('./utils');
const menu = require('./menu');

const inquirer = require("inquirer");

function getBalance() {
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

function getCurrentAddress() {
	for (let i in addressList["addresses"]){
		if(!addressList["addresses"][i].chain_stats && !addressList["addresses"][i].mempool_stats) {
			return addressList["addresses"][i].address
		}
	}
}

async function showTxsHistory () {
	utils.printText("\n--- transaction history ---\n")
	let txs = []
	for (let i in addressList["addresses"]){
		if(addressList["addresses"][i].chain_stats || addressList["addresses"][i].mempool_stats) {
			let address = addressList["addresses"][i].address;
			let txs = await explorer.getAddressTxs(address);
			for (let k in txs) {
				utils.printText("txid: " + txs[k].txid, "green")
				if(txs[k].status.confirmed) {
					utils.printText("confirmed: " + txs[k].status.confirmed, "green");
				} else {
					utils.printText("confirmed: " + txs[k].status.confirmed, "yellow");
				}
				for (let n in txs[k].vin) {
					if(txs[k].vin[n].scriptpubkey_address === address) {
						let amount = utils.satoshiToBtc(txs[k].vin[n].value);
						utils.printText('amount: ' + amount);
						utils.printText('type: sent\n', "green");
					}
				}
				for (let n in txs[k].vout) {
					if(txs[k].vout[n].scriptpubkey_address === address) {
						let amount = utils.satoshiToBtc(txs[k].vout[n].value);
						utils.printText('amount: ' + amount);
						utils.printText('type: received\n', "green");
					}
				}
			}
		}

	}
	askMenu()
}



async function askMenu () {
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
			utils.clear();
			showTxsHistory();
			break;
		case menu.choices[3]:
			utils.clear();
			return;
			break;
		}
}

utils.clear();
utils.printLogo();
utils.printVersion();

let addressList;
async function main() {
	let blockhash = await explorer.getLastBlockHash();
	let blocksheight = await explorer.getLastBlockHeight();
	addressList = await wallet.generateAddresses();
	let depositAddress = getCurrentAddress();
	let balance = getBalance();

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

	askMenu();
}

main()
