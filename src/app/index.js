const compression = require('compression');
const express = require('express');
const requestContext = require('express-http-context');
const helmet = require('helmet');
const config = require('config');
const cors = require('cors');
const swagger = require('swagger-ui-express');
const { StatusCodes } = require('http-status-codes');

// WIP firestore stuff
// WIP Check basePath and https

// Router
const IndexRouter = require('../routers/indexRouter');
const AuthorizationRouter = require('../routers/authorizationRouter');

// Interceptors
const RequestInterceptor = require('../interceptors/request');

class Service {
  constructor(logger, gitCommit) {
    this.gitCommit = gitCommit;
    this.logger = logger;
    this.initDate = new Date().toISOString();
  }

  async init() {
    this._app = express();

    this._app.use(compression());
    this._app.use(helmet());
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(express.json());
    this._app.use(cors(config.get('cors')));
    this._app.use(requestContext.middleware);

    this._app.use(RequestInterceptor());

    // Routers
    const initConfig = { gitCommit: this.gitCommit, initDate: this.initDate };
    this._app.use(IndexRouter(initConfig));
    this._app.use(AuthorizationRouter());

    const swaggerContent = require('../swagger')();
    this._app.use('/documentation', swagger.serve, swagger.setup(swaggerContent));

    // eslint-disable-next-line no-unused-vars
    const errorHandler = (err, req, res, next) => {
      this.logger.error('Unhandled error in', { method: req.method, path: req.path, err });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    };

    this._app.use(errorHandler);
  }

  async listen(...params) {
    this._app.listen(...params);
  }
}

module.exports = Service;
