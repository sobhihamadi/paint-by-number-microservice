import { IdentifierGenerationRequest } from "../../model/generation_requests.model";
import { ID, Initializable } from "../IRepository";
import { IGenerationRequestRepository } from "../IGenerationrequests";
import { ConnectionManager } from "./DBConnection";
import logger from "../../util/logger";
import { 
  InitializationException, 
  RequestNotFoundException, 
  DbException 
} from "../../util/exceptions/repositoryexceptions";
import { IPostgresRequest, PostgresRequestMapper } from "../../mapper/RequestMapper";

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS generation_requests (
  "id" TEXT PRIMARY KEY,
  "original_filename" TEXT NOT NULL,
  "original_image_path" TEXT NOT NULL,
  "color_count" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "client_session_id" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL,
  "output_path" TEXT,
  "error_message" TEXT,
  "completed_at" TIMESTAMP
);`;

const INSERT_REQUEST = `
INSERT INTO generation_requests
("id", "original_filename", "original_image_path", "color_count", "difficulty", 
 "status", "client_session_id", "created_at", "output_path", "error_message", "completed_at")
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
`;

const GET_BY_ID = `SELECT * FROM generation_requests WHERE id=$1;`;

const GET_ALL = `SELECT * FROM generation_requests ORDER BY created_at DESC;`;

const UPDATE_REQUEST = `
UPDATE generation_requests SET 
"original_filename"=$1,
"original_image_path"=$2,
"color_count"=$3,
"difficulty"=$4,
"status"=$5,
"client_session_id"=$6,
"created_at"=$7,
"output_path"=$8,
"error_message"=$9,
"completed_at"=$10
WHERE "id"=$11;
`;

const COUNT_BY_SESSION = `SELECT COUNT(*) FROM generation_requests WHERE client_session_id=$1;`;

const GET_BY_SESSION = `SELECT * FROM generation_requests WHERE client_session_id=$1 ORDER BY created_at DESC;`;

export class GenerationRequestRepositoryPostgre 
  implements IGenerationRequestRepository, Initializable {

  private mapper: PostgresRequestMapper;

  constructor() {
    this.mapper = new PostgresRequestMapper();
  }

  async init(): Promise<void> {
    try {
      const conn = await ConnectionManager.getPostgreConnection();
      await conn.query(CREATE_TABLE);
      logger.info("PostgreSQL generation_requests table created or already exists.");
    } catch (error: unknown) {
      logger.error("Error during PostgreSQL generation_requests table initialization " + (error as Error));
      throw new InitializationException("Failed to initialize the PostgreSQL generation_requests database.");
    }
  }

  async create(item: IdentifierGenerationRequest): Promise<ID> {
    try {
      const conn = await ConnectionManager.getPostgreConnection();
      const data = this.mapper.reverseMap(item);

      await conn.query(INSERT_REQUEST, [
        data.id,
        data.original_filename,
        data.original_image_path,
        data.color_count,
        data.difficulty,
        data.status,
        data.client_session_id,
        data.created_at,
        data.output_path,
        data.error_message,
        data.completed_at
      ]);

      logger.info("Generation request inserted into PostgreSQL database with ID: %s", item.getid());
      return item.getid();
    } catch (error) {
      logger.error("Error during inserting generation request into PostgreSQL " + (error as Error));
      throw new DbException("Failed to insert generation request into PostgreSQL database.");
    }
  }

  async get(id: ID): Promise<IdentifierGenerationRequest> {
    try {
      const conn = await ConnectionManager.getPostgreConnection();
      const result = await conn.query<IPostgresRequest>(GET_BY_ID, [id]);

      if (result.rows.length === 0) {
        throw new RequestNotFoundException(`Generation request with ID ${id} not found.`);
      }

      logger.info("Generation request retrieved from PostgreSQL database with ID: %s", id);
      return this.mapper.map(result.rows[0]);
    } catch (error) {
      if (error instanceof RequestNotFoundException) {
        throw error;
      }
      logger.error("Error during getting generation request from PostgreSQL " + (error as Error));
      throw new DbException("Failed to get generation request from PostgreSQL database.");
    }
  }

  async getall(): Promise<IdentifierGenerationRequest[]> {
    try {
      const conn = await ConnectionManager.getPostgreConnection();
      const result = await conn.query<IPostgresRequest>(GET_ALL);

      logger.info("Get ALL generation requests from PostgreSQL database");
      return result.rows.map((request) => this.mapper.map(request));
    } catch (error) {
      logger.error("Error during getting all generation requests from PostgreSQL " + (error as Error));
      throw new DbException("Failed to get all generation requests from PostgreSQL database.");
    }
  }

  async update(item: IdentifierGenerationRequest): Promise<void> {
    try {
      const conn = await ConnectionManager.getPostgreConnection();
      const data = this.mapper.reverseMap(item);

      const result = await conn.query(UPDATE_REQUEST, [
        data.original_filename,
        data.original_image_path,
        data.color_count,
        data.difficulty,
        data.status,
        data.client_session_id,
        data.created_at,
        data.output_path,
        data.error_message,
        data.completed_at,
        data.id
      ]);

      if (result.rowCount === 0) {
        throw new RequestNotFoundException(`Generation request with ID ${item.getid()} not found for update.`);
      }

      logger.info("Generation request updated in PostgreSQL database with ID: %s", item.getid());
    } catch (error) {
      if (error instanceof RequestNotFoundException) {
        throw error;
      }
      logger.error("Error during updating generation request in PostgreSQL " + (error as Error));
      throw new DbException("Failed to update generation request in PostgreSQL database.");
    }
  }

  async countByClientSessionId(sessionId: string): Promise<number> {
    try {
      const conn = await ConnectionManager.getPostgreConnection();
      const result = await conn.query<{ count: string }>(COUNT_BY_SESSION, [sessionId]);

      const count = parseInt(result.rows[0].count, 10);
      logger.info("Counted %d generation requests for session ID: %s", count, sessionId);
      return count;
    } catch (error) {
      logger.error("Error during counting generation requests by session from PostgreSQL " + (error as Error));
      throw new DbException("Failed to count generation requests by session from PostgreSQL database.");
    }
  }

  async getByClientSessionId(sessionId: string): Promise<IdentifierGenerationRequest[]> {
    try {
      const conn = await ConnectionManager.getPostgreConnection();
      const result = await conn.query<IPostgresRequest>(GET_BY_SESSION, [sessionId]);

      logger.info("Retrieved %d generation requests for session ID: %s", result.rows.length, sessionId);
      return result.rows.map((request) => this.mapper.map(request));
    } catch (error) {
      logger.error("Error during getting generation requests by session from PostgreSQL " + (error as Error));
      throw new DbException("Failed to get generation requests by session from PostgreSQL database.");
    }
  }
}