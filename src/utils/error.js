const { StatusCodes } = require('http-status-codes');

class CustomError extends Error {
  constructor(message, responseCode) {
    super();
    this.message = message;
    this.responseCode = responseCode || StatusCodes.INTERNAL_SERVER_ERROR;
    this.customError = true;
  }
}

const handleError = (response, error, logger) => {
  const { responseCode, message } = error;

  logger.warn(message, { ...error, custom: undefined, code: undefined });

  return response.status(responseCode).json({ message });
};

const isExpectedError = (error) => !!error.customError;

module.exports = () => ({
  CustomError,
  handleError,
  isExpectedError,
});
