## Run the application

### Using docker

```sh
docker-compose up -d
```

Open http://127.0.0.1:3000 in your browser.

!!! It can take a long time because of installing packages

### Without docker

```sh
npm install
npm start
```

Open http://127.0.0.1:3000 in your browser.
You have to provide env variables: RATE_LIMIT and REDIS_STRING

## Tests

You have to provide env variables: RATE_LIMIT and REDIS_STRING

```sh
npm install
npm test
```