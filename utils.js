const qrcode = require('qrcode-terminal');
const chalk = require("chalk");
const figlet = require("figlet");
const clear = require('clear');
const inquirer = require("inquirer");
const validate = require('bitcoin-address-validation');

const explorer = require('./explorer/explorer');
const wallet = require('./wallet/wallet');
const config = require('./config');
const conversion = require('./wallet/conversion_utils');
const menu_main = require('./interfaces/main');
const menu_txs_history = require('./interfaces/txs_history');
const menu_send_0 = require('./interfaces/send_tx_0');



exports.printQR = function (address) {
  return qrcode.generate(address, {small: true})
};

exports.printLogo = function () {
  console.log(
    chalk.green(
      figlet.textSync(require('./package.json').name)
    )
  )
};

exports.printVersion = function () {
  console.log('v' + require('./package.json').version)
};

exports.printText = function (text, color) {
  if(color === 'green') console.log(chalk.green(text));
  if(color === 'red') console.log(chalk.red(text));
  if(color === 'yellow') console.log(chalk.yellow(text));
  if(!color) console.log(text);
};

exports.clear = function () {
  clear();
};

exports.showMenu = async function (interface) {
	const answer = await inquirer.prompt(interface.questions);
	interface.callback(answer);
  return answer;
};

exports.showTxsHistory = async function () {
  let addressList = wallet.getAddresses();
	this.printText("\n--- transaction history ---\n");
	let txs = [];
	for (let i in addressList){
		if(addressList[i].chain_stats || addressList[i].mempool_stats) {
			let address = addressList[i].address;
			let txs = await explorer.getAddressTxs(address);
			for (let k in txs) {
				this.printText("txid: " + txs[k].txid, "green");
				if(txs[k].status.confirmed) {
					this.printText("confirmed: " + txs[k].status.confirmed, "green");
				} else {
					this.printText("confirmed: " + txs[k].status.confirmed, "yellow");
				}
				for (let n in txs[k].vin) {
					if(txs[k].vin[n].scriptpubkey_address === address) {
						let amount = conversion.satoshiToBtc(txs[k].vin[n].value);
						this.printText('amount: ' + amount);
						this.printText('type: sent\n', "green");
					}
				}
				for (let n in txs[k].vout) {
					if(txs[k].vout[n].scriptpubkey_address === address) {
						let amount = conversion.satoshiToBtc(txs[k].vout[n].value);
						this.printText('amount: ' + amount);
						this.printText('type: received\n', "green");
					}
				}
			}
		}

	}
	this.showMenu(menu_txs_history);
};

exports.askTransactionDetails = async function () {

  let addressList = wallet.getAddresses();
  let balance = wallet.getBalance();

  // wallet info
  this.printText("\n--- prepare transaction ---\n");
	this.printText("confirmed balance: " + conversion.satoshiToBtc(balance.confirmed),"green");
	this.printText("unconfirmed balance: " + conversion.satoshiToBtc(balance.unconfirmed),"yellow");
  this.printText("\n");

  let feeRates = await explorer.getEstimatedFees();
  // network fees
  this.printText("-- estimated network fees (sat/vB) --");
  this.printText("2 blocks: " + feeRates['2'], "yellow");
  this.printText("6 blocks: " + feeRates['6'], "yellow");
  this.printText("1008 blocks: " + feeRates['1008'], "yellow");
  this.printText("\n");

  let data = await this.showMenu(menu_send_0);

  if(data.amount >= balance.confirmed + balance.unconfirmed) {
    this.printText("amount is too big", "red");
    this.askTransactionDetails();
  }

  let tx = await wallet.prepareTx(addressList, data.address, data.amount, feeRates[data.priority]);
  // console.log(tx.extractTransaction());
};

exports.validateAddress = function (address) {
	return !!validate(address)[config.network];
};

exports.refresh = async function (refreshData) {
  if(refreshData) await wallet.refresh();
  let blockhash = await explorer.getLastBlockHash();
	let blocksheight = await explorer.getLastBlockHeight();
	let depositAddress = await wallet.getCurrentAddress();
	let balance = wallet.getBalance();

	// blockchain info
	this.printText("network: " + config.network, "red");
	this.printText("blockchain height: " + blocksheight);
	this.printText("last block hash: " + blockhash);

	// wallet info
	this.printText("confirmed balance: " + conversion.satoshiToBtc(balance.confirmed),"green");
	this.printText("unconfirmed balance: " + conversion.satoshiToBtc(balance.unconfirmed),"yellow");

	// deposit address
	this.printText("deposit address: " + depositAddress);
	this.printQR(depositAddress);

	this.showMenu(menu_main);
};
