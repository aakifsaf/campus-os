import { StatusCodes } from 'http-status-codes';

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorResponse;
