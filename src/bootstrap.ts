import 'reflect-metadata';
import './server';
import { error } from 'node:console';
import { logger } from './shared/utils/logger';

process.on('uncaughtException', (error) => {
    logger.error('Uncaught fatal error during startup', error);
    process.exit(1);
})