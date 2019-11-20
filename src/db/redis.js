let redis = require('redis');

if (process.env.NODE_ENV === 'test') {
  // yes, it is much better to mock it inside tests
  // but proxyquire and mockery did not handle it out of the box..
  // so I ended up monkey-patching here = )
  // just need more time to mock it in tests
  redis = require('redis-mock');
}
const bluebird = require('bluebird');
const {redis: {host, port}} = require('config');

bluebird.promisifyAll(redis);
const redisClient = redis.createClient({host, port});

module.exports = redisClient;
