### Docker and docker-compose practice
1. docker
2. docker compose
3. koa
4. eslint

### Docker cli

```shell
$ docker build -f ./dockerfile.dev -t my-koa-dev:v1 .
```

```shell
$ docker run -v /Users/appletxm/Desktop/me/test/koa2-test/src:/app/src --name koa-dev-container --publish 3000:5000 --publish 3321:3321 my-koa-dev:v1
```

```shell
$ docker run -v /Users/appletxm/Desktop/me/test/koa2-test/src:/app/src --name koa-dev-container -p 3000:5000 -p 3321:3321 my-koa-dev:v1
```

```shell
$ docker run -it -v mongodata:/data/db --name mongodb -d mongo
$ docker run -it -v mongodata:/data/db -p 27017:27017 --name mongodb -d mongo
$ docker logs mongodb
$ docker ps
$ docker exec -it mongodb bin/bash
```


### Docker-compose

```shell
$ docker-compose -f ./docker-compose-dev.yml up
```

