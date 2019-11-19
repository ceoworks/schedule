const {delayedTasksKey} = require('config');

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
    expect(scheduleResult).toEqual(1);
    const processTasksResult = await processScheduledTasks();
    console.log('processTasksResult:', processTasksResult);
    expect(processTasksResult).toEqual('No expired tasks yet');
    await timeout(delay);
    const processedTasks = await processScheduledTasks();
    console.log('processedTasks:', processedTasks);
    expect(processedTasks[0].message).toEqual(testTask.message);
  });
});
