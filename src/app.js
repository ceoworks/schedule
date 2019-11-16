const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const errorHandlerMiddleware = require('./middleware/errorHandler');
const setupRoutes = require('./route');

const port = 21212;

const app = new Koa();

app.use(errorHandlerMiddleware);
app.use(bodyParser());
app.use(setupRoutes());

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});
