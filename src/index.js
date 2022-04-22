const Koa = require('koa');
const app = new Koa();
const ipAddress = require('ip').address()
const port = 5000
const chalk = require('chalk')

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(async (ctx) => {
  ctx.body = 'Hello World';
  ctx.cookies.set('name', 'tobi')
});

app.listen(port, () => {
  // console.info(chalk.blue('...npm_package_name:' + process.env.npm_package_name));
  // console.info(chalk.blue('...npm_lifecycle_event:', process.env.npm_lifecycle_event));
  console.info(chalk.yellow('\n*** server start from at ***'))
  console.info(chalk.green(`http://localhost:${port}`))
  console.info(chalk.green(`http://${ipAddress}:${port}`))
  console.info(chalk.yellow('***************************\n'))
});

// app.on('error', err => {
//   log.error('server error', err)
// })

app.on('error', (err, ctx) => {
  log.error('server error', err, ctx)
})
