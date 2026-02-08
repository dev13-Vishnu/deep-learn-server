import { RefreshToken } from '../../domain/entities/RefreshToken';

export interface RefreshTokenRepositoryPort {
  create(refreshToken: RefreshToken): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}