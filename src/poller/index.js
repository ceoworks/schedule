const {pollIntervalMs} = require('config');
const processScheduledTasks = require('./processScheduledTasks');

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function doPolling() {
  await processScheduledTasks();
  await timeout(pollIntervalMs);
  return doPolling();
}

doPolling();
