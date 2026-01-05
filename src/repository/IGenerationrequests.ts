import { IdentifierGenerationRequest } from "../model/generation_requests.model";
import { GenerationStatus } from "../model/IGenerationRequest";
import { ID, IRepository } from "./IRepository";

/**
 * Repository interface for Generation Requests
 * 
 * Inherits from IRepository<IdentifierGenerationRequest>:
 * - create(item: IdentifierGenerationRequest): Promise<ID>
 * - get(id: ID): Promise<IdentifierGenerationRequest>
 * - getall(): Promise<IdentifierGenerationRequest[]>
 * - update(item: IdentifierGenerationRequest): Promise<void>
 * - delete(id: ID): Promise<void>
 * 
 * Adds generation-specific methods:
 */
export interface IGenerationRequestRepository extends IRepository<IdentifierGenerationRequest> {
  /**
   * Counts requests by client session (for 2-credit limit enforcement)
   */
  countByClientSessionId(sessionId: string): Promise<number>;

  /**
   * Retrieves user's request history
   */
  getByClientSessionId(sessionId: string): Promise<IdentifierGenerationRequest[]>;

  /**
   * Admin panel: Filter requests by status (OPTIONAL for MVP)
   */
  getByStatus(status: GenerationStatus): Promise<IdentifierGenerationRequest[]>;
}