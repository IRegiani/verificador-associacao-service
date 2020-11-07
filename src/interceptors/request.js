const onFinished = require('on-finished');
const requestContext = require('express-http-context');
const logger = require('../utils/logger').initLogger({ name: 'REQUEST INTERCEPTOR' });

module.exports = () => {
  const beforeRequest = (request) => {
    const reqId = Math.random().toString(36).substr(2, 9);
    const { username } = request.body;

    requestContext.set('reqId', reqId);
    requestContext.set('username', username);
    requestContext.set('initTime', new Date().getMilliseconds());
  };

  const afterFinished = (request, response) => {
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent');
    const status = response.statusCode;
    const { method, url } = request;
    const time = new Date().getMilliseconds() - requestContext.get('initTime');

    let loggerLevel = 'complete';
    if (status >= 500 && status < 600) loggerLevel = 'error';
    if (status >= 400 && status < 500) loggerLevel = 'warn';

    logger[loggerLevel]('Request completed', { status, method, url, userAgent, ip, time });
  };

  const RequestInterceptor = (request, response, next) => {
    beforeRequest(request);
    onFinished(response, () => afterFinished(request, response));
    next();
  };

  return RequestInterceptor;
};
