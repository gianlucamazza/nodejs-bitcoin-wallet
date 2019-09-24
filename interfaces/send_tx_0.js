const utils = require('./../utils');
const questions = [];
let tx = {};

const choices = [
  'edit address',
  'go back'
];

questions.push({
  type: 'input',
  name: 'template',
  message: 'insert destionation address:',
});

function callback (template) {
  if(utils.validateAddress(template)) {
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
