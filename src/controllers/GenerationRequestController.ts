import { Request, Response } from "express";
import { GenerationRequestService } from "../services/GenerationRequestService";
import { ColorCount, Difficulty } from "../model/IGenerationRequest";
import { BadRequestException } from "../util/exceptions/http/BadRequestException";
import logger from "../util/logger";

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

export class GenerationRequestController {
  constructor(private readonly generationService: GenerationRequestService) {}

  /**
   * POST /api/requests
   * Create a new generation request
   */
  public async createRequest(req: RequestWithFile, res: Response) {
   
    // Validate file upload
    if (!req.file) {
      throw new BadRequestException("Image file is required", { FileMissing: true });
    }

    // Validate request body
    const { colorCount, difficulty } = req.body;
    if (!colorCount || !difficulty) {
      throw new BadRequestException("colorCount and difficulty are required", {
        ColorCountMissing: !colorCount,
        DifficultyMissing: !difficulty
      });
    }

    // Get client session ID (from cookie or header)
    const clientSessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;
    if (!clientSessionId) {
      throw new BadRequestException("Client session ID is required", { SessionIdMissing: true });
      
    }

    // Parse enum values
    const colorCountEnum = this.parseColorCount(colorCount);
    const difficultyEnum = this.parseDifficulty(difficulty);

    // Create request
    const request = await this.generationService.createRequest(
      req.file.originalname,
      req.file.path,
      colorCountEnum,
      difficultyEnum,
      clientSessionId
    );

    logger.info("Generation request created with ID: %s", request.getid());

    res.status(201).json({
      id: request.getid(),
      status: request.getStatus(),
      createdAt: request.getCreatedAt()
    });
    
  }

  /**
   * GET /api/requests/:id
   * Get request status by ID (for polling)
   */
  public async getRequest(req: Request, res: Response) {
    const requestId = req.params.id;
    if (!requestId) {
      throw new BadRequestException("Request ID is required", { RequestIdMissing: true });
    }

    const request = await this.generationService.getRequestById(requestId);

    res.status(200).json({
      id: request.getid(),
      originalFilename: request.getOriginalFilename(),
      colorCount: request.getColorCount(),
      difficulty: request.getDifficulty(),
      status: request.getStatus(),
      createdAt: request.getCreatedAt(),
      outputPath: request.getOutputPath(),
      errorMessage: request.getErrorMessage(),
      completedAt: request.getCompletedAt()
    });
  }

  /**
   * GET /api/requests/session/:sessionId
   * Get all requests for a specific session (user history)
   */
  public async getRequestsBySession(req: Request, res: Response) {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      throw new BadRequestException("Session ID is required", { SessionIdMissing: true });
    }

    const requests = await this.generationService.getRequestsBySession(sessionId);

    res.status(200).json(
      requests.map(request => ({
        id: request.getid(),
        originalFilename: request.getOriginalFilename(),
        colorCount: request.getColorCount(),
        difficulty: request.getDifficulty(),
        status: request.getStatus(),
        createdAt: request.getCreatedAt(),
        outputPath: request.getOutputPath(),
        errorMessage: request.getErrorMessage(),
        completedAt: request.getCompletedAt()
      }))
    );
  }

  /**
   * GET /api/requests
   * Get all requests (admin only)
   */
  public async getAllRequests(req: Request, res: Response) {
    const requests = await this.generationService.getAllRequests();

    res.status(200).json(
      requests.map(request => ({
        id: request.getid(),
        originalFilename: request.getOriginalFilename(),
        colorCount: request.getColorCount(),
        difficulty: request.getDifficulty(),
        status: request.getStatus(),
        clientSessionId: request.getClientSessionId(),
        createdAt: request.getCreatedAt(),
        outputPath: request.getOutputPath(),
        errorMessage: request.getErrorMessage(),
        completedAt: request.getCompletedAt()
      }))
    );
  }

  /**
   * GET /api/requests/credits/:sessionId
   * Get remaining credits for a session
   */
  public async getRemainingCredits(req: Request, res: Response) {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      throw new BadRequestException("Session ID is required", { SessionIdMissing: true });
    }

    const remainingCredits = await this.generationService.getRemainingCredits(sessionId);

    res.status(200).json({
      sessionId,
      remainingCredits,
      totalCredits: 2
    });
  }

  /**
   * Helper method to parse ColorCount enum
   */
  private parseColorCount(value: string): ColorCount {
    switch (value) {
      case "16":
        return ColorCount.C16;
      case "32":
        return ColorCount.C32;
      case "50":
        return ColorCount.C50;
      default:
        throw new BadRequestException(`Invalid color count: ${value}. Must be 16, 32, or 50`, {
          InvalidColorCount: true
        });
    }
  }

  /**
   * Helper method to parse Difficulty enum
   */
  private parseDifficulty(value: string): Difficulty {
    const lowerValue = value.toLowerCase();
    switch (lowerValue) {
      case "easy":
        return Difficulty.Easy;
      case "medium":
        return Difficulty.Medium;
      case "hard":
        return Difficulty.Hard;
      default:
        throw new BadRequestException(
          `Invalid difficulty: ${value}. Must be easy, medium, or hard`,
          { InvalidDifficulty: true }
        );
    }
  }
}