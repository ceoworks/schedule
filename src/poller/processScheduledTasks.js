const {delayedTasksKey, lockTimeout} = require('config');
const redisClient = require('../db/redis');

const SLEEP_RESPONSE = 'sleep';
const LOCK_NOT_ACQUIRED = 0;

function logMessage(label, message = '') {
  console.log(`${label} @ ${Date.now()}`, message);
}
function getLockTimestamp() {
  return Date.now() + lockTimeout;
}
async function getExpiredTasks() {
  const currentTimestamp = Date.now().toString();
  return redisClient.zrangebyscoreAsync(delayedTasksKey, '-inf', currentTimestamp);
}
async function lockTask(taskId) {
  return redisClient.setnxAsync(taskId, getLockTimestamp());
}
async function getTaskLockTimestamp(taskId) {
  return redisClient.getAsync(taskId);
}
async function tryToSetNewLockTimestamp(taskId) {
  return redisClient.getsetAsync(taskId, getLockTimestamp());
}
async function deleteProcessedTaskFromSet(taskJson) {
  return redisClient.zremAsync(delayedTasksKey, taskJson);
}
async function handleTask(taskJson) {
  const task = JSON.parse(taskJson);
  const setResult = await lockTask(task.id);
  if (setResult === LOCK_NOT_ACQUIRED) {
    const taskLockTimestamp = await getTaskLockTimestamp(task.id);
    if (parseInt(taskLockTimestamp, 10) > Date.now()) {
      return SLEEP_RESPONSE;
    }
    const recentTaskLockTimestamp = await tryToSetNewLockTimestamp(task.id);
    if (recentTaskLockTimestamp !== taskLockTimestamp) {
      return SLEEP_RESPONSE;
    }
  }
  logMessage('Scheduled message', task.message);
  await deleteProcessedTaskFromSet(taskJson);
  return task;
}

async function processScheduledTasks() {
  const scheduledTasks = await getExpiredTasks();
  if (!scheduledTasks.length) {
    logMessage('No expired tasks yet');
    return Promise.resolve();
  }
  logMessage('Processing tasks', scheduledTasks.length);
  const taskPromises = scheduledTasks.map(handleTask);
  return Promise.all(taskPromises);
}

module.exports = processScheduledTasks;
