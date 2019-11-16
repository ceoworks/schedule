const Router = require('koa-router');

const koaRouter = new Router();

module.exports = function setupRoutes() {
  require('./tasks')(koaRouter);

  return koaRouter.routes();
};
