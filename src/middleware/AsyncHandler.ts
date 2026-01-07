import { Response, Request, NextFunction } from "express";

/**
 * Async handler wrapper for Express route handlers
 * Automatically catches errors from async functions and passes them to error middleware
 * 
 * Usage:
 * route.get('/', asynchandler(controller.getAllRequests.bind(controller)));
 * 
 * Without this wrapper, you'd need try-catch in every controller method
 */
export const asynchandler = (fn: { (req: Request, res: Response): Promise<void> }) => {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
};