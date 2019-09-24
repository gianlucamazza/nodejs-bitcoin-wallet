const utils = require('./../utils');
const questions = [];

const choices = [
  'refresh transactions',
  'go back'
];

questions.push({
  type: 'input',
  name: 'template',
  message: 'insert destionation address:',
  choices: choices,
});

function callback (template) {
  switch (template) {
    case choices[0]:
      break;
    case choices[1]:
      break;
    }
}

module.exports = {
  questions,
  choices,
  callback
}
