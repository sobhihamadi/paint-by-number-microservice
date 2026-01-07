/**
 * Base HTTP Exception class
 */
export class HttpException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Exception
 * Used for validation errors and invalid input
 */
export class BadRequestException extends HttpException {
  constructor(
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message, 400);
  }
}

/**
 * 404 Not Found Exception
 * Used when a requested resource doesn't exist
 */
export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, 404);
  }
}

/**
 * 401 Unauthorized Exception
 * Used for authentication failures
 */
export class UnauthorizedException extends HttpException {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden Exception
 * Used for authorization failures
 */
export class ForbiddenException extends HttpException {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

/**
 * 500 Internal Server Error Exception
 * Used for unexpected server errors
 */
export class InternalServerErrorException extends HttpException {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}