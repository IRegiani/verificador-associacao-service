const compression = require('compression');
const express = require('express');
const requestContext = require('express-http-context');
const helmet = require('helmet');
const config = require('config');
const cors = require('cors');
const swagger = require('swagger-ui-express');

// WIP some DB thing
// Check basePath

// WIP some logger thing 'dd-trace'

// Router
const IndexRouter = require('../routers/indexRouter');
// const AuthorizationRouter = require('../routers/AuthorizationRouter');

// Interceptors
// const RequestInterceptor = require('../interceptors/request');

class Service {
  constructor(logger, gitCommit) {
    this.gitCommit = gitCommit;
    this.initDate = new Date().toISOString();
  }

  // async init(logger) {
  async init() {
    this._app = express();

    this._app.use(compression());
    this._app.use(helmet());
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(cors(config.get('cors')));
    this._app.use(requestContext.middleware);

    // this._app.use(RequestInterceptor());

    // Routers
    const initConfig = { gitCommit: this.gitCommit, initDate: this.initDate };
    this._app.use(IndexRouter(initConfig));
    this._app.use(IndexRouter(initConfig));

    const swaggerContent = require('../swagger')();
    this._app.use('/documentation', swagger.serve, swagger.setup(swaggerContent));

    // WIP Error Handler
  }

  async listen(...params) {
    this._app.listen(...params);
  }
}

module.exports = Service;
