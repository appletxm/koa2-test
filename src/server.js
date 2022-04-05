const Koa = require('koa');
const app = new Koa();
const ipAddress = require('ip').address()
const port = 5000
const chalk = require('chalk')

app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(port, () => {
  // console.info(chalk.blue('...npm_package_name:' + process.env.npm_package_name));
  // console.info(chalk.blue('...npm_lifecycle_event:', process.env.npm_lifecycle_event));
  console.info(chalk.yellow('\n**************server start from at*************'))
  console.info(chalk.green(`http://localhost:${port}`))
  console.info(chalk.green(`http://${ipAddress}:${port}`))
  console.info(chalk.yellow('***************************\n'))
});
