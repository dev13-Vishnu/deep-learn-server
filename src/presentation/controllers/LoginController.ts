import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { LoginUserUseCase } from '../../application/auth/LoginUserUseCase';
import { RefreshAccessTokenUseCase } from '../../application/auth/RefreshAccessTokenUseCase';
import { GetCurrentUserUseCase } from '../../application/auth/GetCurrentUserUseCase';
import { RevokeRefreshTokenUseCase } from '../../application/auth/RevokeRefreshTokenUseCase';

@injectable()
export class LoginController {
  constructor(
    @inject(TYPES.LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase,

    @inject(TYPES.GetCurrentUserUseCase)
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,

    @inject(TYPES.RefreshAccessTokenUseCase)
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,

    @inject(TYPES.RevokeRefreshTokenUseCase)
    private readonly revokeRefreshTokenUseCase: RevokeRefreshTokenUseCase,
  ) {}

  async login(email: string, password: string) {
    return this.loginUserUseCase.execute({ email, password });
  }

  async getCurrentUser(userId: string) {
    const user = await this.getCurrentUserUseCase.execute({ userId });
    return { user };
  }

  async refreshToken(plainToken: string) {
    return this.refreshAccessTokenUseCase.execute(plainToken);
  }

  async logout(refreshToken: string | null): Promise<{ message: string }> {
    if (refreshToken) {
      await this.revokeRefreshTokenUseCase.execute(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }
}