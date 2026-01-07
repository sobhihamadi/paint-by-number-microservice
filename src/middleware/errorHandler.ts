import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../util/exceptions/http/BadRequestException";
import { NotFoundException } from "../util/exceptions/http/NotFoundException";
import logger from "../util/logger";

/**
 * Global error handling middleware
 * Catches all errors thrown in route handlers and formats them as JSON responses
 * 
 * Must be registered AFTER all routes in app.ts:
 * app.use('/api', routes);
 * app.use(errorHandler); // <-- Last middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  logger.error("Error occurred: %s", error.message, {
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // Handle specific exception types
  if (error instanceof BadRequestException) {
    return res.status(400).json({
      error: error.message,
      details: error.details,
      timestamp: new Date().toISOString()
    });
  }

  if (error instanceof NotFoundException) {
    return res.status(404).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  // Handle multer file upload errors
  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      error: error.message,
      details: { InvalidFileType: true },
      timestamp: new Date().toISOString()
    });
  }

  if (error.message.includes('File too large')) {
    return res.status(400).json({
      error: "File size exceeds 10MB limit",
      details: { FileTooLarge: true },
      timestamp: new Date().toISOString()
    });
  }

  // Handle database errors
  if (error.message.includes('database') || error.message.includes('PostgreSQL')) {
    return res.status(500).json({
      error: "Database error occurred",
      timestamp: new Date().toISOString()
    });
  }

  // Default: Internal Server Error
  return res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
};