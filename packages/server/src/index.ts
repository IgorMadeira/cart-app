import app from './app';
import { config } from './lib/config';
import logger from './lib/logger';

app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info(`Swagger UI: http://localhost:${config.port}/api/docs`);
});
