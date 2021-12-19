const config = require('../config')
const rateLimit = require('../middleware/ratelimit')
const redis = require('redis')

//jest.mock('redis', () => jest.requireActual('redis-mock'))

const client = redis.createClient({
  url: config.redisConnectionString
});

client.connect()

const token = 'Token'
let returnedStatus
let returnedMessage

const res = {
  status: status => {
    returnedStatus = status
    return res
  },
  send: message => {
    returnedMessage = message
    return res
  }
}

const req = {
  headers: {
    authorization: 'Bearer ' + token
  },
  redis: client
}

const next = () => {
  returnedStatus = 200
  returnedMessage = 'OK'
}

beforeAll(async () => {
  await new Promise (resolve  => {
    client.on('ready', async () => {
      await client.del(token)
      resolve()
    })
  })
})

afterAll(async () => {
  await client.del(token)
  await client.quit()
})

test('should allow call', async () => {
  await rateLimit()(req, res, next)
  
  expect(returnedStatus).toBe(200)
  expect(returnedMessage).toBe('OK')
});

test('should restrict call without token', async () => {
  const req = {
    headers: {}
  }
  await rateLimit()(req, res, next)
  
  expect(returnedStatus).toBe(403)
  expect(returnedMessage).toBe('Invalid token')
});

test('should restrict call with default weight', async () => {
  await client.set(token, config.limitPerHour)
  await client.expire(token, 3600)

  const nextTime = new Date()
  nextTime.setHours(nextTime.getHours() + 1)
  
  await rateLimit()(req, res, next)
  
  const expectedTime = new Date(returnedMessage.slice(-24))
  
  expect(returnedStatus).toBe(429)
  expect(returnedMessage.slice(0, -25)).toBe('Too many requests. Retry after')
  expect(Math.abs(expectedTime - nextTime)).toBeLessThan(10)
});

test('should restrict call different weight', async () => {
  const weight = 5

  await client.set(token, config.limitPerHour - weight + 1)
  await client.expire(token, 3600)

  const nextTime = new Date()
  nextTime.setHours(nextTime.getHours() + 1)
  
  await rateLimit(5)(req, res, next)

  const expectedTime = new Date(returnedMessage.slice(-24))

  expect(returnedStatus).toBe(429)
  expect(returnedMessage.slice(0, -25)).toBe('Too many requests. Retry after')
  expect(Math.abs(expectedTime - nextTime)).toBeLessThan(10)
});