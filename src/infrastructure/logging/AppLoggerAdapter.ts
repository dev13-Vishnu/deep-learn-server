import { injectable } from 'inversify';
import { LoggerPort } from '../../application/ports/LoggerPort';
import { logger } from '../../shared/utils/logger';

@injectable()
export class AppLoggerAdapter implements LoggerPort {
  info(message: string): void {
    logger.info(message);
  }

  warn(message: string): void {
    logger.warn(message);
  }

  error(message: string, error?: unknown): void {
    logger.error(message, error);
  }
}