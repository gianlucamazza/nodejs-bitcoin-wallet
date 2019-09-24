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
     message: 'What to you want to do?',
     choices: choices,
     default: choices[1],
   });

module.exports = {
  questions,
  choices
}
