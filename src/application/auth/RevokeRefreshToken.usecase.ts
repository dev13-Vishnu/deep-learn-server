import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { RefreshTokenRepository } from "../../domain/auth/RefreshTokenRepository";

@injectable()
export class RevokeRefreshTokenUseCase {
    constructor (
        @inject(TYPES.RefreshTokenRepositoryPort)
        private readonly refreshTokenRepository: RefreshTokenRepository
    ) {}

    async execute(tokenHash: string): Promise<void> {
        await this.refreshTokenRepository.revoke(tokenHash);
    }
}