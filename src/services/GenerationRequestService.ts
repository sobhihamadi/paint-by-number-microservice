import {  IdentifierGenerationRequest } from "../model/generation_requests.model";
import { ColorCount, Difficulty, GenerationStatus } from "../model/IGenerationRequest";
import { IGenerationRequestRepository } from "../repository/IGenerationrequests";
import { ID } from "../repository/IRepository";
import { RequestNotFoundException } from "../util/exceptions/repositoryexceptions";
import { BadRequestException } from "../util/exceptions/http/BadRequestException";
import { randomUUID } from "crypto";
import { PythonServiceClient } from "./PythonServiceClient"; // ✅ Add
import logger from "../util/logger";


export class GenerationRequestService {
  private pythonClient: PythonServiceClient;
  constructor(private repository: IGenerationRequestRepository) {
    this.pythonClient = new PythonServiceClient();
  }

  /**
   * Creates a new generation request
   * Validates credit limit (2 free credits per session)
   * Validates input parameters
   * Triggers Python processing service
   */
  public async createRequest(
    originalFilename: string,
    originalImagePath: string,
    colorCount: ColorCount,
    difficulty: Difficulty,
    clientSessionId: string
  ): Promise<IdentifierGenerationRequest> {
   
    // Validate input
    this.validateCreateRequest(originalFilename, originalImagePath, clientSessionId);

    // Check credit limit (2 free requests per session)
    const requestCount = await this.repository.countByClientSessionId(clientSessionId);
    if (requestCount >= 2) {
      throw new BadRequestException(
        "Credit limit reached. You have used all 2 free credits.",
        { currentUsage: requestCount, limit: 2 }
      );
    }

    // Create new request with Pending status (default)
    const id = randomUUID();

    const request = new IdentifierGenerationRequest(
      id,
      originalFilename,
      originalImagePath,
      colorCount,
      difficulty,
      GenerationStatus.Pending, // Starts as Pending
      clientSessionId,
      new Date() // createdAt
    );

    

    // Save to database
    await this.repository.create(request);
    // ✅ Trigger Python service (async, don't wait)
    this.triggerPythonProcessing(id, originalImagePath, colorCount, difficulty)
      .catch(err => {
        logger.error("Failed to trigger Python processing for request %s: %s", id, err);
        // Optionally: Mark request as failed here
      });

    return request;
  }


  
  

  /**
   * Gets a specific generation request by ID
   * Used for status polling and result retrieval
   */
  public async getRequestById(id: ID): Promise<IdentifierGenerationRequest> {
    try {
      const request = await this.repository.get(id);
      return request;
    } catch (error) {
      throw new RequestNotFoundException(`Generation request with ID ${id} not found`);
    }
  }

  /**
   * Gets all generation requests for a specific client session
   * Used for user history page
   */
  public async getRequestsBySession(clientSessionId: string): Promise<IdentifierGenerationRequest[]> {
    if (!clientSessionId || clientSessionId.trim() === "") {
      throw new BadRequestException("Client session ID is required");
    }

    const requests = await this.repository.getByClientSessionId(clientSessionId);
    return requests;
  }

  /**
   * Gets all generation requests (admin only)
   * Used for admin panel monitoring
   */
  public async getAllRequests(): Promise<IdentifierGenerationRequest[]> {
    const requests = await this.repository.getall();
    return requests;
  }

  /**
   * Marks a request as Processing
   * Called by Python service when it starts processing
   */
  public async markAsProcessing(id: ID): Promise<void> {
    const request = await this.repository.get(id);

    if (!request) {
      throw new RequestNotFoundException(`Generation request with ID ${id} not found`);
    }

    // Domain method validates state transition
    request.markAsProcessing();

    // Save updated status to database
    await this.repository.update(request);
  }

  /**
   * Marks a request as Completed
   * Called by Python service when processing succeeds
   */
  public async markAsCompleted(id: ID, outputPath: string): Promise<void> {
    if (!outputPath || outputPath.trim() === "") {
      throw new BadRequestException("Output path is required to mark request as completed");
    }

    const request = await this.repository.get(id);

    if (!request) {
      throw new RequestNotFoundException(`Generation request with ID ${id} not found`);
    }

    // Domain method validates state transition and sets outputPath, completedAt
    request.markAsCompleted(outputPath);

    // Save updated status to database
    await this.repository.update(request);
  }

  /**
   * Marks a request as Failed
   * Called by Python service when processing fails
   */
  public async markAsFailed(id: ID, errorMessage: string): Promise<void> {
    if (!errorMessage || errorMessage.trim() === "") {
      throw new BadRequestException("Error message is required to mark request as failed");
    }

    const request = await this.repository.get(id);

    if (!request) {
      throw new RequestNotFoundException(`Generation request with ID ${id} not found`);
    }

    // Domain method validates state transition and sets errorMessage, completedAt
    request.markAsFailed(errorMessage);

    // Save updated status to database
    await this.repository.update(request);
  }

  /**
   * Gets remaining credits for a client session
   * Helper method for frontend to display remaining credits
   */
  public async getRemainingCredits(clientSessionId: string): Promise<number> {
    if (!clientSessionId || clientSessionId.trim() === "") {
      throw new BadRequestException("Client session ID is required");
    }

    const usedCredits = await this.repository.countByClientSessionId(clientSessionId);
    const remainingCredits = Math.max(0, 2 - usedCredits);
    
    return remainingCredits;
  }

  /**
   * Validates request creation parameters
   * Private helper method
   */
  private validateCreateRequest(
    originalFilename: string,
    originalImagePath: string,
    clientSessionId: string
  ): void {
    const errors: Record<string, boolean> = {};

    if (!originalFilename || originalFilename.trim() === "") {
      errors.filenameRequired = true;
    }

    if (!originalImagePath || originalImagePath.trim() === "") {
      errors.imagePathRequired = true;
    }

    if (!clientSessionId || clientSessionId.trim() === "") {
      errors.sessionIdRequired = true;
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(
        "Invalid request: filename, image path, and session ID are required",
        errors
      );
    }
  }
  
  /**
   * Triggers Python service to process the image
   * Runs asynchronously - doesn't block request creation response
   */
  private async triggerPythonProcessing(
    requestId: string,
    imagePath: string,
    colorCount: ColorCount,
    difficulty: Difficulty
  ): Promise<void> {
    try {
      // Convert enum to number/string for Python
      const colorCountValue = parseInt(colorCount.valueOf());
      const difficultyValue = difficulty.toLowerCase();

      await this.pythonClient.triggerProcessing(
        requestId,
        imagePath,
        colorCountValue,
        difficultyValue
      );

      logger.info("Successfully triggered Python processing for request: %s", requestId);
    } catch (error) {
      logger.error("Error triggering Python processing: %s", error);
      
      // Mark request as failed since Python couldn't be triggered
      try {
        const request = await this.repository.get(requestId);
        request.markAsFailed("Failed to start processing");
        await this.repository.update(request);
      } catch (updateError) {
        logger.error("Failed to mark request as failed: %s", updateError);
      }
    }
  }



}