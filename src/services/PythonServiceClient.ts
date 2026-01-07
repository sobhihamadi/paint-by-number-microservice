import axios from 'axios';
import config from '../config';
import logger from '../util/logger';

/**
 * Client for communicating with Python processing service
 */
export class PythonServiceClient {
  private pythonServiceUrl: string;

  constructor() {
    this.pythonServiceUrl = config.PYTHON_SERVICE_URL ;
  }

  /**
   * Triggers Python service to start processing an image
   */
  async triggerProcessing(
  requestId: string,
  imagePath: string,
  colorCount: number,
  difficulty: string
): Promise<void> {
  const url = `${this.pythonServiceUrl}/process`;
  
  try {
    // This creates the "x-www-form-urlencoded" format that worked in Postman
    const params = new URLSearchParams();
    params.append('request_id', requestId);
    params.append('image_path', imagePath);
    params.append('color_count', colorCount.toString());
    params.append('difficulty', difficulty);

    const response = await axios.post(url, params, {
      timeout: 10000, // 10 seconds is safer for image tasks
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    logger.info("Python service triggered successfully for request: %s", requestId);
    return response.data;
  } catch (error) {
    logger.error("Failed to trigger Python service: %s", error);
    throw error;
  }
}
}