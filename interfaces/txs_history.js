const utils = require('./../utils');
const questions = [];

const choices = [
  'refresh transactions',
  'go back'
];

questions.push({
  type: 'list',
  name: 'template',
  message: 'What do you want to do?',
  choices: choices,
  default: choices[1],
});

function callback (answer) {
  switch (answer.template) {
    case choices[0]:
      utils.clear();
      utils.showTxsHistory();
      break;
    case choices[1]:
      utils.clear();
      utils.runWallet();
      break;
    }
}

module.exports = {
  questions,
  choices,
  callback
}
