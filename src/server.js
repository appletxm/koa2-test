const Koa = require('koa');
const app = new Koa();

// 此处开始堆叠各种中间件
//...

app.use(ctx => {
    ctx.body = 'Hello Koa';
});

app.listen(3000, () => {
    console.info('server started.....');
});

console.info(process.env.npm_package_name);
console.info(process.env.npm_lifecycle_event);
