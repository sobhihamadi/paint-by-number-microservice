import { Router } from "express";
import { GenerationRequestController } from "../controllers/GenerationRequestController";
import { GenerationRequestService } from "../services/GenerationRequestService";
import { GenerationRequestRepositoryPostgre } from "../repository/postgreSQL/RequestRepositoryPostgre";
import { asynchandler } from "../middleware/AsyncHandler";
import { uploadSingleImage } from "../middleware/upload.middleware";

// Initialize repository, service, and controller
const repository = new GenerationRequestRepositoryPostgre();
const service = new GenerationRequestService(repository);
const controller = new GenerationRequestController(service);

const route = Router();

// Public routes
route.route('/')
  .get(asynchandler(controller.getAllRequests.bind(controller)))
  
  .post(uploadSingleImage, asynchandler(controller.createRequest.bind(controller)));

route.route('/session/:sessionId')
  .get(asynchandler(controller.getRequestsBySession.bind(controller)));

route.route('/credits/:sessionId')
  .get(asynchandler(controller.getRemainingCredits.bind(controller)));

route.route('/:id')
  .get(asynchandler(controller.getRequest.bind(controller)));

export default route;