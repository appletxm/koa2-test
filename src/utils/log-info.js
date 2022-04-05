
const chalk = require('chalk')

const error = (msg) => { console.log(chalk.red(msg)) }
const warn = (msg) => { console.log(chalk.keyword('orange')(msg)) }
const log = (msg) => { console.log(chalk.blue(msg)) }

module.exports = {
  error,
  warn,
  log
}