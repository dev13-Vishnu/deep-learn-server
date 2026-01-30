import { inject, injectable } from "inversify";

import { TYPES } from "../../shared/di/types";

import { RefreshTokenRepository } from "../../domain/auth/RefreshTokenRepository";
import { TokenServicePort } from "../ports/TokenServicePort";
import { RefreshToken } from "../../domain/auth/RefreshToken";


const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

@injectable()
export class CreateRefreshTokenUseCase {
    constructor(
        @inject(TYPES.RefreshTokenRepositoryPort)
        private readonly refreshTokenRepository: RefreshTokenRepository,

        @inject(TYPES.TokenServicePort)
        private readonly tokenService: TokenServicePort
    ) {}

    async execute (userId: string): Promise<{
        token: string;
        expiresAt: Date;
    }> {
        const token = this.tokenService.generateRefreshToken();
        const tokenHash = this.tokenService.hashToken(token);

        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        const refreshToken: RefreshToken = {
            userId,
            tokenHash,
            expiresAt
        }
        return {
            token,
            expiresAt
        }
    }
}