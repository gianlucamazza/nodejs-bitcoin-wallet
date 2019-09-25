const utils = require('./../utils');
const questions = [];

const choices = [
  'refresh transactions',
  'go back'
];

questions.push({
  type: 'list',
  name: 'menu_txs_history',
  message: 'What do you want to do?',
  choices: choices,
  default: choices[1],
});

function callback (menu_txs_history) {
  switch (menu_txs_history) {
    case choices[0]:
      utils.clear();
      utils.showTxsHistory();
      break;
    case choices[1]:
      utils.clear();
      utils.refresh();
      break;
    }
}

module.exports = {
  questions,
  choices,
  callback
}
