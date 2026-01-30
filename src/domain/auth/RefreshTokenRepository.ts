import { RefreshToken } from './RefreshToken';

export interface RefreshTokenRepository {
  create(token: RefreshToken): Promise<void>;
  findByHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(tokenHash: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
