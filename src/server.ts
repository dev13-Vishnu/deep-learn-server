import { createExpressApp } from './infrastructure/http/express';
import { env } from './shared/config/env';
import { logger } from './shared/utils/logger';


const app = createExpressApp();

const server = app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port}`);
});

function shutdown(signal: string) {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);
logger.info('HTTP server closed');


  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown if something hangs
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
