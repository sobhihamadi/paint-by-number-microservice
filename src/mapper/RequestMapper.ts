import { IMapper } from "./IMapper";
import { IdentifierGenerationRequest } from "../model/generation_requests.model";
import { ColorCount, Difficulty, GenerationStatus } from "../model/IGenerationRequest";



export interface IPostgresRequest {
  id: string;
  original_filename: string;
  original_image_path: string;
  color_count: string;
  difficulty: string;
  status: string;
  client_session_id: string;
  created_at: Date;
  output_path: string | null;
  error_message: string | null;
  completed_at: Date | null;
}
export class PostgresRequestMapper implements IMapper<IPostgresRequest, IdentifierGenerationRequest> {
  
  map(data: IPostgresRequest): IdentifierGenerationRequest {
    

    const colorCount = this.mapColorCount(data.color_count);
    const difficulty = this.mapDifficulty(data.difficulty);
    const status = this.mapStatus(data.status);

    return new IdentifierGenerationRequest(
      data.id,
      data.original_filename,
      data.original_image_path,
      colorCount,
      difficulty,
      status,
      data.client_session_id,
      data.created_at,
      data.output_path,
      data.error_message,
      data.completed_at
    );
  }

  reverseMap(data: IdentifierGenerationRequest): IPostgresRequest {
    return {
      id: data.getid(),
      original_filename: data.getOriginalFilename(),
      original_image_path: data.getOriginalImagePath(),
      color_count: this.reverseMapColorCount(data.getColorCount()),
      difficulty: this.reverseMapDifficulty(data.getDifficulty()),
      status: this.reverseMapStatus(data.getStatus()),
      client_session_id: data.getClientSessionId(),
      created_at: data.getCreatedAt(),
      output_path: data.getOutputPath(),
      error_message: data.getErrorMessage(),
      completed_at: data.getCompletedAt()
    };
  }

  private mapColorCount(value: string): ColorCount {
    switch (value) {
      case "16": return ColorCount.C16;
      case "32": return ColorCount.C32;
      case "50": return ColorCount.C50;
      default: throw new Error(`Invalid color_count value in database: ${value}`);
    }
  }

  private mapDifficulty(value: string): Difficulty {
    switch (value) {
      case "easy": return Difficulty.Easy;
      case "medium": return Difficulty.Medium;
      case "hard": return Difficulty.Hard;
      default: throw new Error(`Invalid difficulty value in database: ${value}`);
    }
  }

  private mapStatus(value: string): GenerationStatus {
    switch (value) {
      case "pending": return GenerationStatus.Pending;
      case "processing": return GenerationStatus.Processing;
      case "completed": return GenerationStatus.Completed;
      case "failed": return GenerationStatus.Failed;
      default: throw new Error(`Invalid status value in database: ${value}`);
    }
  }

  private reverseMapColorCount(value: ColorCount): string {
    switch (value) {
      case ColorCount.C16: return "16";
      case ColorCount.C32: return "32";
      case ColorCount.C50: return "50";
      default: throw new Error(`Invalid ColorCount enum value: ${value}`);
    }
  }

  private reverseMapDifficulty(value: Difficulty): string {
    switch (value) {
      case Difficulty.Easy: return "easy";
      case Difficulty.Medium: return "medium";
      case Difficulty.Hard: return "hard";
      default: throw new Error(`Invalid Difficulty enum value: ${value}`);
    }
  }

  private reverseMapStatus(value: GenerationStatus): string {
    switch (value) {
      case GenerationStatus.Pending: return "pending";
      case GenerationStatus.Processing: return "processing";
      case GenerationStatus.Completed: return "completed";
      case GenerationStatus.Failed: return "failed";
      default: throw new Error(`Invalid GenerationStatus enum value: ${value}`);
    }
  }
}