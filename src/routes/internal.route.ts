import { Router } from "express";
import { InternalController } from "../controllers/InternalController";
import { GenerationRequestService } from "../services/GenerationRequestService";
import { GenerationRequestRepositoryPostgre } from "../repository/postgreSQL/RequestRepositoryPostgre";
import { asynchandler } from "../middleware/AsyncHandler";

// Initialize repository, service, and controller
const repository = new GenerationRequestRepositoryPostgre();
const service = new GenerationRequestService(repository);
const controller = new InternalController(service);

const route = Router();

// Internal routes (called by Python service)
route.post('/requests/:id/processing', asynchandler(controller.markAsProcessing.bind(controller)));
route.post('/requests/:id/complete', asynchandler(controller.markAsCompleted.bind(controller)));
route.post('/requests/:id/fail', asynchandler(controller.markAsFailed.bind(controller)));

export default route;