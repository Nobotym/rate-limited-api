const express = require('express')
const redis = require('redis')
const {asyncMiddleware} = require('middleware-async')
const config = require('./config')

const app = express()
const port = 3000

const rateLimit = require('./middleware/ratelimit')

const client = redis.createClient({
  url: config.redisConnectionString
});

client.connect()

app.use((req, res, next) => {
  req.redis = client
  next()
});

app.get('/', asyncMiddleware(rateLimit()), (req, res) => {
  res.send('/')
})
app.post('/1', asyncMiddleware(rateLimit()), (req, res) => {
  res.send('1')
})
app.post('/2', asyncMiddleware(rateLimit(2)), (req, res) => {
  res.send('2')
})
app.post('/3', asyncMiddleware(rateLimit(3)), (req, res) => {
  res.send('3')
})
app.post('/4', asyncMiddleware(rateLimit(4)), (req, res) => {
  res.send('4')
})
app.post('/5', asyncMiddleware(rateLimit(5)), (req, res) => {
  res.send('5')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})