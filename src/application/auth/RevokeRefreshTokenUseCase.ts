import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { TokenServicePort } from "../ports/TokenServicePort";
import { RefreshTokenRepositoryPort } from "../ports/RefreshTokenRepositoryPort";

@injectable()
export class RevokeRefreshTokenUseCase {
    constructor (
        @inject(TYPES.RefreshTokenRepositoryPort)
        private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
        
        @inject(TYPES.TokenServicePort)
        private readonly tokenService: TokenServicePort,
    ) {}

    async execute(plainToken: string): Promise<void> {
        const tokenHash = this.tokenService.hashToken(plainToken)
        await this.refreshTokenRepository.revoke(tokenHash);
    }
}