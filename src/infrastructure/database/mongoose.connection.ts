import mongoose from 'mongoose';
import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';
import './models/user.model';


/**
 * Register MongoDB lifecycle events (call once)
 */
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established (event)');
});

mongoose.connection.on('disconnected', () => {
  logger.info('MongoDB connection closed (event)');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error (event)', error);
});

export async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnect initiated');
  } catch (error) {
    logger.error('Error while disconnecting MongoDB', error);
  }
}
