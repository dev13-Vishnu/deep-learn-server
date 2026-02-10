import { RefreshToken } from '../../domain/entities/RefreshToken';

export interface RefreshTokenRepositoryPort {
  create(refreshToken: RefreshToken): Promise<void>;
  findByHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(tokenHash: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  // deleteByTokenHash(tokenHash: string): Promise<void>;
}