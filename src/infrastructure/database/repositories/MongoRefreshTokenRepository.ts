import { injectable } from "inversify";
// import { RefreshToken } from "../../../domain/auth/RefreshToken";
import { RefreshTokenModel } from "../models/RefreshTokenModel";
import { AppError } from "../../../shared/errors/AppError";
import { RefreshTokenRepositoryPort } from "../../../application/ports/RefreshTokenRepositoryPort";
import { RefreshToken } from "../../../domain/entities/RefreshToken";

@injectable()
export class MongoRefreshTokenRepository implements RefreshTokenRepositoryPort {
    async create (token: RefreshToken): Promise <void> {
        try {
            await RefreshTokenModel.create({
                userId: token.userId,
                tokenHash: token.tokenHash,
                expiresAt: token.expiresAt,
            });
        } catch (error) {
            throw new AppError('Failed to create refresh token', 500);
        }
    }

    async findByHash(tokenHash: string): Promise<RefreshToken | null> {
        try {
            const doc = await RefreshTokenModel.findOne({ tokenHash }).lean();

            if(!doc) {
                return null;
            }

            return new RefreshToken(
                doc._id.toString(),
                doc?.userId.toString(),
                doc?.tokenHash,
                doc?.expiresAt,
                doc?.createdAt,
            )
        } catch {
            throw new AppError('Failed to find refresh token', 500);
        }
    }

    async revoke(tokenHash: string): Promise<void> {
        try {
            await RefreshTokenModel.deleteOne({tokenHash});
        } catch (error) {
            throw new AppError('Failed to revoke refresh token', 500);
        }
    }
    async revokeAllForUser(userId: string): Promise<void> {
        try {
            await RefreshTokenModel.deleteMany({userId});
        } catch (error) {
            throw new AppError('Failed to revoke refresh token for users', 500);
        }
    }
}