import { IdentifierGenerationRequest } from "../model/generation_requests.model";
import { GenerationStatus } from "../model/IGenerationRequest";
import { ID, IRepository } from "./IRepository";

/**
 * Repository interface for Generation Requests
 * 
 * Inherits from IRepository<IdentifierGenerationRequest>:
 * - create(request: IdentifierGenerationRequest): Promise<ID>
 *   Creates a new generation request in the database with status "Pending"
 * 
 * - get(id: ID): Promise<IdentifierGenerationRequest>
 *   Retrieves a single request by ID for status polling and result retrieval
 * 
 * - getall(): Promise<IdentifierGenerationRequest[]>
 *   Retrieves all requests across all users for admin panel monitoring
 * 
 * - update(request: IdentifierGenerationRequest): Promise<void>
 *   Updates request status and related fields (outputPath, errorMessage, completedAt)
 *   Used by service layer after calling domain methods (markAsProcessing, markAsCompleted, markAsFailed)
 * 
 * Adds generation-specific query methods below:
 */
export interface IGenerationRequestRepository extends IRepository<IdentifierGenerationRequest> {
  /**
   * Counts the total number of generation requests made by a specific client session.
   * 
   * Use case: Enforce the 2-credit limit for anonymous users in MVP.
   * Before allowing a new request creation, the service layer calls this method
   * to verify the user hasn't exceeded their free credit allocation.
   * 
   * @param sessionId - The client session identifier (typically stored in browser cookie/localStorage)
   * @returns A Promise that resolves to the count of requests associated with this session
   * @throws {DbException} If there is a database error during the count operation
   * 
   * @example
   * ```typescript
   * const usageCount = await repository.countByClientSessionId("abc123");
   * if (usageCount >= 2) {
   *   throw new Error("Credit limit reached. Please create an account for more generations.");
   * }
   * ```
   */
  countByClientSessionId(sessionId: string): Promise<number>;

  /**
   * Retrieves all generation requests made by a specific client session, ordered by creation date (newest first).
   * 
   * Use case: Display user's generation history on the platform.
   * Shows the user all their previous requests including current status, creation time,
   * and download links for completed requests.
   * 
   * Frontend use case:
   * - "My Generations" page showing user's past requests
   * - Status indicators (pending/processing/completed/failed)
   * - Download buttons for completed requests
   * - Retry options for failed requests
   * 
   * @param sessionId - The client session identifier to filter requests by
   * @returns A Promise that resolves to an array of all requests for that session, ordered by newest first
   * @throws {DbException} If there is a database error during the retrieval process
   * 
   * @example
   * ```typescript
   * const userHistory = await repository.getByClientSessionId("abc123");
   * // Returns: [
   * //   { id: "req_003", status: "completed", createdAt: "2026-01-05T14:30:00Z", ... },
   * //   { id: "req_002", status: "failed", createdAt: "2026-01-05T10:15:00Z", ... },
   * //   { id: "req_001", status: "completed", createdAt: "2026-01-04T09:00:00Z", ... }
   * // ]
   * ```
   */
  getByClientSessionId(sessionId: string): Promise<IdentifierGenerationRequest[]>;


}