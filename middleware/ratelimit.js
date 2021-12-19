const config = require('../config')

const handleResponse = (res, status, data) => res.status(status).send(data)

const rateLimit = (weight = 1) => {
  return async (req, res, next) => {
    if (!req.headers || !req.headers.authorization) {
      return handleResponse(res, 403, 'Invalid token')
    }

    const tokenInfo = req.headers.authorization.split(' ')
    if (tokenInfo[0] !== 'Bearer' || !tokenInfo[1]) {
      return handleResponse(res, 403, 'Invalid token')
    }

    const savedWeight = await req.redis.incrBy(tokenInfo[1], weight)

    if (savedWeight === weight)
      await req.redis.expire(tokenInfo[1], 3600)

    if (savedWeight > config.limitPerHour) {
      const ttl = await req.redis.ttl(tokenInfo[1])
      const nextTime = new Date()
      nextTime.setSeconds(nextTime.getSeconds() + ttl)

      return handleResponse(res, 429, 'Too many requests. Retry after ' + nextTime.toISOString())
    }

    next()
  }
}

module.exports = rateLimit