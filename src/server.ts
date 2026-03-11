import { Express } from 'express';
import { env } from './shared/config/env';
import { LoggerPort } from './application/ports/LoggerPort';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/mongoose.connection';
import { initRedis } from './infrastructure/redis/redis.client';

export async function startServer(app: Express, logger: LoggerPort): Promise<void> {
  await connectDatabase(logger);
  await initRedis();

  const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });

  function shutdown(signal: string) {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      await disconnectDatabase(logger);
      logger.info('HTTP server closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forcing shutdown');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}