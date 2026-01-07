import { ID } from "../repository/IRepository";
import  { ColorCount, Difficulty, GenerationStatus, IIdentifierRequest,  IRequest } from "./IGenerationRequest";







export class GenerationRequest implements IRequest {

  private originalFilename: string;
  private originalImagePath: string;
  private colorCount: ColorCount;
  private difficulty: Difficulty;
  private status: GenerationStatus;
  private clientSessionId: string;
  private createdAt: Date;

  private outputPath: string | null;
  private errorMessage: string | null;
  private completedAt: Date |null;



  constructor(
    originalFilename: string,
    originalImagePath: string,
    colorCount: ColorCount,
    difficulty: Difficulty,
    status: GenerationStatus=GenerationStatus.Pending,
    clientSessionId: string,
    createdAt: Date=new Date(),
    outputPath: string |null=null ,
    errorMessage: string|null=null,
    completedAt: Date|null=null,
  ) {
    this.originalFilename = originalFilename;
    this.originalImagePath = originalImagePath;
    this.colorCount = colorCount;
    this.difficulty = difficulty;
    this.status = status;
    this.clientSessionId = clientSessionId;
    this.createdAt = createdAt;
    this.outputPath = outputPath;
    this.errorMessage = errorMessage;
    this.completedAt = completedAt;
  }
  

  getOriginalFilename(): string {
    return this.originalFilename;
  }

  getOriginalImagePath(): string {
    return this.originalImagePath;
  }

  getColorCount(): ColorCount {
    return this.colorCount;
  }

  getDifficulty(): Difficulty {
    return this.difficulty;
  }

  getStatus(): GenerationStatus {
    return this.status;
  }

  getClientSessionId(): string {
    return this.clientSessionId;
  }
    getCreatedAt(): Date {
    return this.createdAt;
  }

  getOutputPath(): string | null {
    return this.outputPath;
  }

  getErrorMessage(): string | null {
    return this.errorMessage;
  }



  getCompletedAt(): Date | null {
    return this.completedAt;
  }



    markAsProcessing(): void {
    if (this.status !== GenerationStatus.Pending) {
      throw new Error('Can only start processing from Pending status');
    }
    this.status = GenerationStatus.Processing;
  }

  markAsCompleted(outputPath: string): void {
    if (this.status !== GenerationStatus.Processing) {
      throw new Error('Can only complete from Processing status');
    }
    this.status = GenerationStatus.Completed;
    this.outputPath = outputPath;
    this.completedAt = new Date();
  }

  markAsFailed(errorMessage: string): void {
    if (this.status !== GenerationStatus.Processing) {
      throw new Error('Can only fail from Processing status');
    }
    this.status = GenerationStatus.Failed;
    this.errorMessage = errorMessage;
    this.completedAt = new Date();
  }

}



export class IdentifierGenerationRequest
  extends GenerationRequest implements IIdentifierRequest {

  constructor(
    private id: ID,
    originalFilename: string,
    originalImagePath: string,
    colorCount: ColorCount,
    difficulty: Difficulty,
    status: GenerationStatus,
    clientSessionId: string,
    createdAt: Date,
    outputPath: string |null=null,
    errorMessage: string |null=null,
    completedAt: Date |null=null,
  ) {
    super(
      originalFilename,
      originalImagePath,
      colorCount,
      difficulty,
      status,
      clientSessionId,
      createdAt,
      outputPath,
      errorMessage,
      completedAt,
    );
  }

  getid(): ID {
    return this.id;
  }
}

