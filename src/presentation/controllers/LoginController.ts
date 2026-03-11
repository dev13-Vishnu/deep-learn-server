import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { ILoginUserUseCase }          from '../../application/ports/inbound/auth/ILoginUserUseCase';
import { IGetCurrentUserUseCase }     from '../../application/ports/inbound/auth/IGetCurrentUserUseCase';
import { IRefreshAccessTokenUseCase } from '../../application/ports/inbound/auth/IRefreshAccessTokenUseCase';
import { IRevokeRefreshTokenUseCase } from '../../application/ports/inbound/auth/IRevokeRefreshTokenUseCase';

@injectable()
export class LoginController {
  constructor(
    @inject(TYPES.LoginUserUseCase)
    private readonly loginUserUseCase: ILoginUserUseCase,

    @inject(TYPES.GetCurrentUserUseCase)
    private readonly getCurrentUserUseCase: IGetCurrentUserUseCase,

    @inject(TYPES.RefreshAccessTokenUseCase)
    private readonly refreshAccessTokenUseCase: IRefreshAccessTokenUseCase,

    @inject(TYPES.RevokeRefreshTokenUseCase)
    private readonly revokeRefreshTokenUseCase: IRevokeRefreshTokenUseCase,
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