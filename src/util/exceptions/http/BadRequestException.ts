/**
 * 400 Bad Request Exception
 * Used for validation errors and invalid input
 * 
 * Example usage:
 * throw new BadRequestException("Invalid order data", {
 *   OrderNotFound: true,
 *   PriceNegative: order.getPrice() <= 0
 * });
 */
export class BadRequestException extends Error {
  public readonly statusCode = 400;

  constructor(
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = "BadRequestException";
    Error.captureStackTrace(this, this.constructor);
  }
}