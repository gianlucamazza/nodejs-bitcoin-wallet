const qrcode = require('qrcode-terminal');
const chalk = require("chalk");
const figlet = require("figlet");
const clear = require('clear');

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
