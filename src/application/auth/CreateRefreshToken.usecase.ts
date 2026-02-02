import { inject, injectable } from "inversify";

import { TYPES } from "../../shared/di/types";

import { RefreshTokenRepository } from "../../domain/auth/RefreshTokenRepository";
import { TokenServicePort } from "../ports/TokenServicePort";
import { RefreshToken } from "../../domain/auth/RefreshToken";
import { authConfig } from "../../shared/config/auth.config";



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

        const expiresAt = new Date(Date.now() + authConfig.refreshToken.expiresInMs);

        const refreshToken: RefreshToken = {
            userId,
            tokenHash,
            expiresAt
        }

        await this.refreshTokenRepository.create(refreshToken);
        
        return {
            token,
            expiresAt
        }
    }
}