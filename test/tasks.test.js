const {delayedTasksKey, lockTimeout} = require('config');

const redisClient = require('../src/db/redis');
const taskService = require('../src/service/taskService');
const processScheduledTasks = require('../src/poller/processScheduledTasks');

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function doCleanUp() {
  await redisClient.zremrangebyscoreAsync(delayedTasksKey, '-inf', '+inf');
  await redisClient.quitAsync();
}

afterAll(doCleanUp);

describe('when testing tasks scheduling', () => {
  test('it should schedule task and process it', async () => {
    const delay = 1000;
    const timestamp = Date.now() + delay;
    const testTask = {message: `I am a test task ${timestamp}`, timestamp};
    const scheduleResult = await taskService.scheduleTask(testTask);
    expect(scheduleResult).toHaveProperty('id');
    expect(scheduleResult).toHaveProperty('message');

    const processTasksResult = await processScheduledTasks();
    expect(processTasksResult).toEqual('No expired tasks yet');

    await timeout(delay);
    const processedTasks = await processScheduledTasks();
    expect(processedTasks[0].message).toEqual(testTask.message);
  });
  test('it should not process locked task', async () => {
    const timestamp = Date.now();
    const testTask = {message: `I am a test task ${timestamp}`, timestamp};
    const {id} = await taskService.scheduleTask(testTask);
    redisClient.setnx(id, Date.now() + lockTimeout);

    const processTasksResult = await processScheduledTasks();
    expect(processTasksResult).toEqual(['sleep']);

    await timeout(lockTimeout);
    const processedTasks = await processScheduledTasks();
    expect(processedTasks[0].message).toEqual(testTask.message);
  });
  test('it should succesfully resolve race condition', async () => {
    const timestamp = Date.now();
    const testTask = {message: `I am a test task ${timestamp}`, timestamp};
    await taskService.scheduleTask(testTask);

    const [firstWorkerResult, secondWorkerResult] = await Promise.all([
      processScheduledTasks(),
      processScheduledTasks(),
    ]);
    expect(firstWorkerResult[0].message).toEqual(testTask.message);
    expect(secondWorkerResult).toEqual(['sleep']);

    await timeout(lockTimeout);
    const processedTasks = await processScheduledTasks();
    expect(processedTasks).toEqual('No expired tasks yet');
  });
});
