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
     name: 'menu',
     message: 'What do you want to do?',
     choices: choices,
     default: choices[1],
});

function callback (result) {
  switch (result.menu) {
    case choices[0]:
      utils.clear();
      utils.askTransactionDetails();
      break;
    case choices[1]:
      utils.clear();
      utils.refresh(true);
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
