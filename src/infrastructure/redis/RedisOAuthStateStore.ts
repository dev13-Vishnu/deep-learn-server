
import { injectable } from 'inversify';
import { OAuthStateStorePort } from '../../application/ports/OAuthStateStorePort';
import { redisClient } from './redis.client';

const STATE_PREFIX = 'oauth:state:';

@injectable()
export class RedisOAuthStateStore implements OAuthStateStorePort {
  async save(state: string, ttlSeconds = 600): Promise<void> {
    await redisClient.set(`${STATE_PREFIX}${state}`, '1', { EX: ttlSeconds });
  }

  async consume(state: string): Promise<boolean> {
    const key = `${STATE_PREFIX}${state}`;

    const value = await redisClient.getDel(key);
    return value !== null;
  }
}