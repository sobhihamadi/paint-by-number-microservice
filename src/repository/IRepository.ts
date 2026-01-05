export type ID = string;

export interface id {
  getid(): ID;
}

export interface Initializable {
  /**
   * Initializes the repository (e.g., creates database tables if needed)
   * @returns A Promise that resolves when initialization is complete
   * @throws {InitializationException} If there is an error during repository initialization
   */
  init(): Promise<void>;
}

/**
 * Generic repository interface for domain entities
 */
export interface IRepository<T extends id> {
  /**
   * Creates a new generation request in the repository.
   * @param request - The generation request to be created.
   * @returns A Promise that resolves to the ID of the created request.
   * @throws {InvalidRequestException} If the request is invalid or does not meet required criteria.
   * @throws {DbException} If there is a database error during the creation process.
   */
  create(request: T): Promise<ID>;

  /**
   * Retrieves a generation request by its ID from the repository.
   * @param id - The unique identifier of the request to retrieve.
   * @returns A Promise that resolves to the request if found.
   * @throws {RequestNotFoundException} If the request with the specified ID does not exist.
   * @throws {DbException} If there is a database error during the retrieval process.
   */
  get(id: ID): Promise<T>;

  /**
   * Retrieves all generation requests from the repository.
   * Used for admin panel to view all requests across all users.
   * @returns A Promise that resolves to an array of all requests in the repository.
   * @throws {DbException} If there is a database error during the retrieval process.
   */
  getall(): Promise<T[]>;

  /**
   * Updates an existing generation request in the repository.
   * Used to update status (pending -> processing -> completed/failed) and results.
   * @param request - The generation request with updated values.
   * @returns A Promise that resolves when the update is complete.
   * @throws {RequestNotFoundException} If the request does not exist.
   * @throws {InvalidRequestException} If the updated request is invalid.
   * @throws {DbException} If there is a database error during the update process.
   */
  update(request: T): Promise<void>;
}

export interface IRepositoryWithInit<T extends id> extends IRepository<T>, Initializable {}