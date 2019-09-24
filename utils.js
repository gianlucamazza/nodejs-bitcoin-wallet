const qrcode = require('qrcode-terminal');
const chalk = require("chalk");
const figlet = require("figlet");
const clear = require('clear');
const inquirer = require("inquirer");
const explorer = require('./explorer/explorer');
const wallet = require('./wallet/wallet.js');
const config = require('./config');
const menu_main = require('./interfaces/main');
const menu_txs_history = require('./interfaces/txs_history');
const menu_send_0 = require('./interfaces/send_tx_0');

exports.printQR = function (address) {
  return qrcode.generate(address, {small: true})
}

exports.printLogo = function () {
  console.log(
    chalk.green(
      figlet.textSync(require('./package.json').name)
    )
  )
}

exports.printVersion = function () {
  console.log('v' + require('./package.json').version)
}

exports.printText = function (text, color) {
  if(color === 'green') console.log(chalk.green(text));
  if(color === 'red') console.log(chalk.red(text));
  if(color === 'yellow') console.log(chalk.yellow(text));
  if(!color) console.log(text);
}

exports.clear = function () {
  clear();
}

exports.satoshiToBtc = function (amount) {
  return (amount / 100000000).toFixed(8);
}

exports.showMenu = async function (interface) {
	const answer = await inquirer.prompt(interface.questions);
	interface.callback(answer.template);
}

exports.getBalance = function (addressList) {
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

exports.showTxsHistory = async function () {
  let addressList = await wallet.generateAddresses();
	this.printText("\n--- transaction history ---\n")
	let txs = []
	for (let i in addressList["addresses"]){
		if(addressList["addresses"][i].chain_stats || addressList["addresses"][i].mempool_stats) {
			let address = addressList["addresses"][i].address;
			let txs = await explorer.getAddressTxs(address);
			for (let k in txs) {
				this.printText("txid: " + txs[k].txid, "green")
				if(txs[k].status.confirmed) {
					this.printText("confirmed: " + txs[k].status.confirmed, "green");
				} else {
					this.printText("confirmed: " + txs[k].status.confirmed, "yellow");
				}
				for (let n in txs[k].vin) {
					if(txs[k].vin[n].scriptpubkey_address === address) {
						let amount = this.satoshiToBtc(txs[k].vin[n].value);
						this.printText('amount: ' + amount);
						this.printText('type: sent\n', "green");
					}
				}
				for (let n in txs[k].vout) {
					if(txs[k].vout[n].scriptpubkey_address === address) {
						let amount = this.satoshiToBtc(txs[k].vout[n].value);
						this.printText('amount: ' + amount);
						this.printText('type: received\n', "green");
					}
				}
			}
		}

	}
	this.showMenu(menu_txs_history);
}

exports.getCurrentAddress = function (addressList) {
	for (let i in addressList["addresses"]){
		if(!addressList["addresses"][i].chain_stats && !addressList["addresses"][i].mempool_stats) {
			return addressList["addresses"][i].address
		}
	}
}

exports.sendTransaction = async function () {
  this.clear();
  let addressList = await wallet.generateAddresses();
  let balance = this.getBalance(addressList);
  this.showMenu(menu_send_0)
}

exports.refresh = async function () {
  let blockhash = await explorer.getLastBlockHash();
	let blocksheight = await explorer.getLastBlockHeight();
	let addressList = await wallet.generateAddresses();
	let depositAddress = this.getCurrentAddress(addressList);
	let balance = this.getBalance(addressList);

	// blockchain info
	this.printText("network: " + config.network, "red");
	this.printText("blockchain height: " + blocksheight);
	this.printText("last block hash: " + blockhash);

	// wallet info
	this.printText("confirmed balance: " + this.satoshiToBtc(balance.confirmed),"green");
	this.printText("unconfirmed balance: " + this.satoshiToBtc(balance.unconfirmed),"yellow");

	// deposit address
	this.printText("deposit address: " + depositAddress,"green");
	this.printQR(depositAddress)

	this.showMenu(menu_main);
}
