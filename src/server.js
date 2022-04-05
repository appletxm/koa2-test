const Koa = require('koa');
const app = new Koa();
const ipAddress = require('ip').address()
const port = 5000
// const host = '0.0.0.0'
// const host = 'localhost'
const chalk = require('chalk')

app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(port, () => {
  console.info('...npm_package_name:' + process.env.npm_package_name);
  console.info('...npm_lifecycle_event:', process.env.npm_lifecycle_event);
  console.info('\n***************************')
  console.info('server start from at')
  console.info(`http://localhost:${port}`)
  console.info(`http://${ipAddress}:${port}`)
  console.info('***************************\n')
});
