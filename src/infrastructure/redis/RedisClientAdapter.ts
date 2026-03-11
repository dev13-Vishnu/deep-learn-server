import { injectable } from 'inversify';
import { RedisClientPort } from '../../application/ports/RedisClientPort';
import { redisClient } from './redis.client';

@injectable()
export class RedisClientAdapter implements RedisClientPort {
  async get(key: string): Promise<string | null> {
    return redisClient.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await redisClient.set(key, value);
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    await redisClient.setEx(key, ttlSeconds, value);
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  async getDel(key: string): Promise<string | null> {
    return redisClient.getDel(key);
  }
}