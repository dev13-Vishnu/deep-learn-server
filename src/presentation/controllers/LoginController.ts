import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { LoginUserUseCase } from '../../application/auth/LoginUserUseCase';
import { RefreshAccessTokenUseCase } from '../../application/auth/RefreshAccessTokenUseCase';
import { LogoutUserUseCase } from '../../application/auth/LogoutUserUseCase';
import { GetCurrentUserUseCase } from '../../application/auth/GetCurrentUserUseCase';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';
import { env } from '../../shared/config/env';
import { authConfig } from '../../shared/config/auth.config';

@injectable()
export class LoginController {
  constructor(
    @inject(TYPES.LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase,

    @inject(TYPES.GetCurrentUserUseCase)
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,

    @inject(TYPES.RefreshAccessTokenUseCase)
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,

    @inject(TYPES.LogoutUserUseCase)
    private readonly logoutUserUseCase: LogoutUserUseCase
  ) {}

  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const result = await this.loginUserUseCase.execute({ email, password });

    // Set refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: authConfig.refreshToken.expiresInMs,
    });


    return res.status(200).json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  async getCurrentUser(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const user = await this.getCurrentUserUseCase.execute(authReq.user!.userId);

    return res.status(200).json({ user });
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const result = await this.refreshAccessTokenUseCase.execute(refreshToken);

    // Set new refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken: result.accessToken,
    });
  }

  async logout(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await this.logoutUserUseCase.execute(refreshToken);
    }

    res.clearCookie('refreshToken');

    return res.status(200).json({
      message: 'Logged out successfully',
    });
  }
}