import mongoose from 'mongoose';
import { env } from '../../shared/config/env';
import { LoggerPort } from '../../application/ports/LoggerPort';
import './models';

export async function connectDatabase(logger: LoggerPort): Promise<void> {
  // Register lifecycle events here so the injected logger is in scope
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });
  mongoose.connection.on('disconnected', () => {
    logger.info('MongoDB connection closed');
  });
  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', error);
  });

  try {
    await mongoose.connect(env.mongoUri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    throw error;
  }
}

export async function disconnectDatabase(logger: LoggerPort): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnect initiated');
  } catch (error) {
    logger.error('Error while disconnecting MongoDB', error);
  }
}