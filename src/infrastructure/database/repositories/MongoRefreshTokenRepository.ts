import { injectable } from 'inversify';
import { RefreshTokenModel } from '../models/RefreshTokenModel';
import { ApplicationError } from '../../../shared/errors/ApplicationError';
import { RefreshTokenRepositoryPort } from '../../../application/ports/RefreshTokenRepositoryPort';
import { RefreshToken } from '../../../domain/entities/RefreshToken';

@injectable()
export class MongoRefreshTokenRepository implements RefreshTokenRepositoryPort {

  async create(token: RefreshToken): Promise<void> {
    try {
      await RefreshTokenModel.create({
        userId:    token.userId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
      });
    } catch (error) {
      throw new ApplicationError('INTERNAL_ERROR', 'Failed to create refresh token');
    }
  }

  async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    try {
      const doc = await RefreshTokenModel.findOne({ tokenHash }).lean();
      if (!doc) return null;
      return new RefreshToken(
        doc._id.toString(),
        doc.userId.toString(),
        doc.tokenHash,
        doc.expiresAt,
        doc.createdAt,
      );
    } catch {
      throw new ApplicationError('INTERNAL_ERROR', 'Failed to find refresh token');
    }
  }

  async revoke(tokenHash: string): Promise<void> {
    try {
      await RefreshTokenModel.deleteOne({ tokenHash });
    } catch (error) {
      throw new ApplicationError('INTERNAL_ERROR', 'Failed to revoke refresh token');
    }
  }

  async revokeAllForUser(userId: string): Promise<void> {
    try {
      await RefreshTokenModel.deleteMany({ userId });
    } catch (error) {
      throw new ApplicationError('INTERNAL_ERROR', 'Failed to revoke refresh tokens for user');
    }
  }
}