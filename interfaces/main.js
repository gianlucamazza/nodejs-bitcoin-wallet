const utils = require('./../utils');
const questions = []

const choices = [
  'send a new transaction',
  'refresh the balance (default)',
  'show the transactions history',
  'exit the wallet'
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
      // FIXME
      break;
    case choices[1]:
      utils.clear();
      utils.runWallet();
      break;
    case choices[2]:
      utils.clear();
      utils.showTxsHistory();
      break;
    case choices[3]:
      utils.clear();
      return;
      break;
    }
}


module.exports = {
  questions,
  choices,
  callback
}
