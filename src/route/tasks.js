const taskService = require('../service/taskService');

module.exports = async (router) => {
  router.post('/api/tasks', async (ctx) => {
    const {request: {body: data}} = ctx;
    ctx.body = await taskService.scheduleTask(data);
  });
};
