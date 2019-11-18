const redis = require('redis');
const bluebird = require('bluebird');
const {redis: {host, port}} = require('config');

bluebird.promisifyAll(redis);
const redisClient = redis.createClient({host, port});

module.exports = redisClient;