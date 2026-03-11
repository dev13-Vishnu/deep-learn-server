import { injectable, inject } from 'inversify';
import { OAuthStateStorePort } from '../../application/ports/OAuthStateStorePort';
import { RedisClientPort } from '../../application/ports/RedisClientPort';
import { TYPES } from '../../shared/di/types';

const STATE_PREFIX = 'oauth:state:';

@injectable()
export class RedisOAuthStateStore implements OAuthStateStorePort {
  constructor(
    @inject(TYPES.RedisClientPort)
    private readonly redis: RedisClientPort,
  ) {}

  async save(state: string, ttlSeconds = 600): Promise<void> {
    await this.redis.setEx(`${STATE_PREFIX}${state}`, ttlSeconds, '1');
  }

  async consume(state: string): Promise<boolean> {
    const value = await this.redis.getDel(`${STATE_PREFIX}${state}`);
    return value !== null;
  }
}