module.exports = {
  limitPerHour: parseInt(process.env.RATE_LIMIT),
  redisConnectionString: process.env.REDIS_STRING
}