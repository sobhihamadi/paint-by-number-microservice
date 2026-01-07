import { Request, Response } from "express";
import { GenerationRequestService } from "../services/GenerationRequestService";
import { BadRequestException } from "../util/exceptions/http/BadRequestException";
import logger from "../util/logger";

/**
 * Internal controller for Python service callbacks
 * These endpoints should NOT be exposed publicly in production
 */
export class InternalController {
  constructor(private readonly generationService: GenerationRequestService) {}

  /**
   * POST /api/internal/requests/:id/processing
   * Called by Python service when processing starts
   */
  public async markAsProcessing(req: Request, res: Response) {
    const requestId = req.params.id;
    
    if (!requestId) {
      throw new BadRequestException("Request ID is required", { RequestIdMissing: true });
    }

    await this.generationService.markAsProcessing(requestId);

    logger.info("Request %s marked as processing", requestId);

    res.status(200).json({
      success: true,
      message: "Request marked as processing"
    });
  }

  /**
   * POST /api/internal/requests/:id/complete
   * Called by Python service when processing completes successfully
   */
  public async markAsCompleted(req: Request, res: Response) {
    const requestId = req.params.id;
    const { outputPath } = req.body;

    if (!requestId) {
      throw new BadRequestException("Request ID is required", { RequestIdMissing: true });
    }

    if (!outputPath) {
      throw new BadRequestException("Output path is required", { OutputPathMissing: true });
    }

    await this.generationService.markAsCompleted(requestId, outputPath);

    logger.info("Request %s marked as completed with output: %s", requestId, outputPath);

    res.status(200).json({
      success: true,
      message: "Request marked as completed",
      outputPath
    });
  }

  /**
   * POST /api/internal/requests/:id/fail
   * Called by Python service when processing fails
   */
  public async markAsFailed(req: Request, res: Response) {
    const requestId = req.params.id;
    const { error } = req.body;

    if (!requestId) {
      throw new BadRequestException("Request ID is required", { RequestIdMissing: true });
    }

    if (!error) {
      throw new BadRequestException("Error message is required", { ErrorMessageMissing: true });
    }

    await this.generationService.markAsFailed(requestId, error);

    logger.error("Request %s marked as failed: %s", requestId, error);

    res.status(200).json({
      success: true,
      message: "Request marked as failed",
      error
    });
  }
}