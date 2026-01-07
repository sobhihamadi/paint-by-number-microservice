import { id } from "../repository/IRepository";

/**
 * Base interface for generation requests
 */
export interface IRequest {
 getOriginalFilename(): string;
  getOriginalImagePath(): string;
  getColorCount(): ColorCount;
  getDifficulty(): Difficulty;
  getStatus(): GenerationStatus;
  getClientSessionId(): string;
  getCreatedAt(): Date;
}

/**
 * Interface for identifiable generation requests
 */
export interface IIdentifierRequest
  extends IRequest, id {
    
  }

/**
 * Enums
 */
export enum GenerationStatus {
  Pending = "pending",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
}

export enum Difficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

export enum ColorCount {
  C16 = "16",
  C32 = "32",
  C50 = "50",
}
