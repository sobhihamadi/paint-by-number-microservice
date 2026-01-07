import { Response, Router } from "express";
import RequestRoutes from "./requests.route";
import InternalRoutes from "./internal.route";
import logger from "../util/logger";
import { ConnectionManager } from "../repository/postgreSQL/DBConnection";
import express from "express";
import path from "path";
import fs from "fs";

const routes = Router();

// Ensure output directory exists
const outputDir = path.join(__dirname, '../../outputs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  logger.info('Created outputs directory: %s', outputDir);
}

// API routes
routes.use('/requests', RequestRoutes);
routes.use('/internal', InternalRoutes);
logger.info('Routes loaded: /requests, /internal');

// Serve static files (output ZIPs for download)
// Users can download results via: GET /api/outputs/req_123_result.zip
routes.use('/outputs', express.static(outputDir));
logger.info('Static route loaded: /outputs → %s', outputDir);

// Health check endpoints
routes.get('/health/status', (req, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Application is healthy',
    timestamp: new Date().toISOString()
  });
});

routes.get('/health/db', async (req, res: Response) => {
  try {
    const dbConnection = await CheckDatabaseConnection();
    if (dbConnection) {
      res.status(200).json({ 
        status: 'Database connection is healthy',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        status: 'Database connection is not healthy',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Database connection failed', error);
    res.status(500).json({ 
      status: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

routes.get('/greet', (req, res: Response) => {
  res.status(200).json({ message: 'Hello from Paint-by-Numbers API!' });
});

async function CheckDatabaseConnection(): Promise<boolean> {
  try {
    const pool = await ConnectionManager.getPostgreConnection();
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

logger.info('Health routes loaded: /health/status, /health/db, /greet');

export default routes;