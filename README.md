### Docker and docker-compose practice
1. docker
2. docker compose
3. koa
4. eslint

### Docker cli

```shell
$docker build -f ./dockerfile.dev -t my-koa-dev:v1 .
```

```shell
$docker run -v /Users/appletxm/Desktop/me/test/koa2-test/src:/app/src --name koa-dev-container --publish 3000:5000 my-koa-dev:v1
```


