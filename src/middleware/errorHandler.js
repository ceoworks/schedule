const defaultErrorCode = 500;

module.exports = async function errorHandlerMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || defaultErrorCode;
    ctx.body = {...err, stack: err.stack};
  }
};
