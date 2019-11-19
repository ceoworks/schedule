module.exports = {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
  pollIntervalMs: 100,
  lockTimeout: 500,
  delayedTasksKey: 'tasks',
};
