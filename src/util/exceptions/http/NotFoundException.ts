/**
 * 404 Not Found Exception
 * Used when a requested resource doesn't exist
 * 
 * Example usage:
 * throw new NotFoundException(`Order with ID ${orderId} not found`);
 */
export class NotFoundException extends Error {
  public readonly statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundException";
    Error.captureStackTrace(this, this.constructor);
  }
}