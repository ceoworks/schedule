const {delayedTasksKey} = require('config');
const uuidv4 = require('uuid/v4');
const redisClient = require('../db/redis');

async function addTaskToSet(element, score) {
  return redisClient.zaddAsync(delayedTasksKey, score, element);
}
async function scheduleTask({message, timestamp}) {
  const id = uuidv4();
  const taskData = {
    id,
    message,
  };
  const taskJson = JSON.stringify(taskData);
  await addTaskToSet(taskJson, timestamp);
  return taskData;
}

module.exports = {
  scheduleTask,
};
