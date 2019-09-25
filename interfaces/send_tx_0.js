const utils = require('./../utils');
const questions = [];
let tx = {};

const choices = [
  'edit address',
  'go back'
];

questions.push({
  type: 'input',
  name: 'address',
  message: 'insert destionation address:',
},
{
  type: 'input',
  name: 'amount',
  message: 'insert amount (BTC):',
});

function callback (result) {
  // FIXME
  if(utils.validateAddress(result.address) && result.amount > 0) {
    return template;
  } else {
    utils.printText('address not valid', 'red');
    utils.sendTransaction();
  }
}

module.exports = {
  questions,
  choices,
  callback
}
