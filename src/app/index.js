const compression = require('compression');
const express = require('express');
const requestContext = require('express-http-context');
const helmet = require('helmet');
const config = require('config');
const cors = require('cors');
const swagger = require('swagger-ui-express');
const { StatusCodes } = require('http-status-codes');
const Firestore = require('@google-cloud/firestore');

// WIP check firestore client
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
      this.logger.error(`Unhandled error in ${req.path}`, { method: req.method, path: req.path, err });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    };

    this._app.use(errorHandler);
    await this.startDB();
  }

  async listen(...params) {
    this._app.listen(...params);
  }

  async startDB() {
    const databaseConfig = config.get('database');
    this._db = new Firestore(databaseConfig);
    const document = this._db.doc('path/dummy-doc');
    await document.get();

    this.logger.info('Database connected successfully');
  }
}

module.exports = Service;
