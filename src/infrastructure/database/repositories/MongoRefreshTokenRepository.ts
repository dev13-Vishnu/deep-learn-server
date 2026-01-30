import { injectable } from "inversify";
import { RefreshTokenRepository } from "../../../domain/auth/RefreshTokenRepository";
import { RefreshToken } from "../../../domain/auth/RefreshToken";
import { RefreshTokenModel } from "../models/RefreshTokenModel";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class MongoRefreshTokenRepository implements RefreshTokenRepository {
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

            return {
                userId: doc.userId.toString(),
                tokenHash: doc.tokenHash,
                expiresAt: new Date(doc.expiresAt)
            }
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
}