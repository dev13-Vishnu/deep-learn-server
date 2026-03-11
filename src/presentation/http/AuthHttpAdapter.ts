import { injectable, inject } from 'inversify';
import { HttpRequest, HttpResponse } from './HttpContext';
import { LoginController } from '../controllers/LoginController';
import { PasswordResetController } from '../controllers/PasswordResetController';
// FIX (same as #7): Use pre-computed cookie config — no inline env/authConfig inspection.
import {
  refreshTokenCookieOptions,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../../shared/config/cookie.config';
import { PRESENTATION_TYPES } from '../di/presentationTypes';

@injectable()
export class AuthHttpAdapter {
  constructor(
    @inject(PRESENTATION_TYPES.LoginController)
    private readonly loginController: LoginController,

    @inject(PRESENTATION_TYPES.PasswordResetController)
    private readonly passwordResetController: PasswordResetController,
  ) {}

  async login(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { email, password } = req.body as { email: string; password: string };
    const result = await this.loginController.login(email, password);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);
    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  async getCurrentUser(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.loginController.getCurrentUser(req.user!.userId);
    res.status(200).json(result);
  }

  async refreshToken(req: HttpRequest, res: HttpResponse): Promise<void> {
    const plainToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (!plainToken) {
      res.status(401).json({ message: 'Refresh token not found' });
      return;
    }
    const result = await this.loginController.refreshToken(plainToken);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);
    res.status(200).json({ accessToken: result.accessToken });
  }

  async logout(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.loginController.logout(
      req.cookies[REFRESH_TOKEN_COOKIE_NAME] ?? null
    );
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    res.status(200).json(result);
  }

  async requestPasswordResetOtp(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { email } = req.body as { email: string };
    const result = await this.passwordResetController.requestOtp(email);
    res.status(200).json(result);
  }

  async verifyPasswordResetOtp(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { email, otp } = req.body as { email: string; otp: string };
    const result = await this.passwordResetController.verifyOtp(email, otp);
    res.status(200).json(result);
  }

  async resetPassword(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { email, password } = req.body as { email: string; password: string };
    const result = await this.passwordResetController.resetPassword(email, password);
    res.status(200).json(result);
  }
}