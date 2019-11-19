const {pollIntervalMs, delayedTasksKey, lockTimeout} = require('config');
const redisClient = require('../db/redis');

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function logMessage(label, message = '') {
  console.log(`${label} @ ${Date.now()}`, message);
}
function getLockTimestamp() {
  return Date.now() + lockTimeout;
}
async function processScheduledTasks() {
  const currentTimestamp = Date.now().toString();
  const scheduledTasks = await redisClient.zrangebyscoreAsync(delayedTasksKey, '-inf', currentTimestamp);
  if (!scheduledTasks.length) {
    logMessage('No expired tasks yet');
    return Promise.resolve();
  }
  logMessage('Processing tasks', scheduledTasks.length);
  const taskPromises = scheduledTasks.map(async (taskJson) => {
    const task = JSON.parse(taskJson);
    const setResult = await redisClient.setnxAsync(task.id, getLockTimestamp());
    if (setResult === 0) {
      const taskLockTimestamp = await redisClient.getAsync(task.id);
      if (parseInt(taskLockTimestamp, 10) > Date.now()) {
        return Promise.resolve();
      }
      const recentTaskLockTimestamp = await redisClient.getsetAsync(task.id, getLockTimestamp());
      if (recentTaskLockTimestamp !== taskLockTimestamp) {
        return Promise.resolve();
      }
    }
    logMessage('Scheduled message', task.message);
    return redisClient.zremAsync(delayedTasksKey, taskJson);
  });
  return Promise.all(taskPromises);
}

async function doPolling() {
  await processScheduledTasks();
  await timeout(pollIntervalMs);
  return doPolling();
}

doPolling();
