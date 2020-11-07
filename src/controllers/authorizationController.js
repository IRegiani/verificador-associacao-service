const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger').initLogger({ name: 'LOGIN CONTROLLER' });
const { CustomError, handleError, isExpectedError } = require('../utils/error')();

module.exports = () => {
  const AuthorizationController = {
    async login(request, response, next) {
      const { body: { username, password } } = request;

      try {
        logger.info('Trying to login', { username });

        if (!username) throw new CustomError('Missing username', StatusCodes.BAD_REQUEST);
        if (!password) throw new CustomError('Missing password', StatusCodes.BAD_REQUEST);

        // TODO: call authorization service to handle authentication logic

        return response.json({ message: 'Success' });
      } catch (error) {
        if (isExpectedError(error)) return handleError(response, error, logger);

        return next(error);
      }
    },
  };

  return AuthorizationController;
};
