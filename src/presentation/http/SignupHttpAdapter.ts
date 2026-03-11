import { injectable, inject } from 'inversify';
import { HttpRequest, HttpResponse } from '../../shared/http/HttpContext';
import { SignupController } from '../controllers/SignupController';
import { refreshTokenCookieOptions, REFRESH_TOKEN_COOKIE_NAME } from '../../shared/config/cookie.config';
import { PRESENTATION_TYPES } from '../di/presentationTypes';

@injectable()
export class SignupHttpAdapter {
  constructor(
    @inject(PRESENTATION_TYPES.SignupController)
    private readonly signupController: SignupController,
  ) {}

  async requestOtp(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { email } = req.body as { email: string };
    const result = await this.signupController.requestOtp(email);
    res.status(200).json(result);
  }

  async verifyOtp(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { email, otp } = req.body as { email: string; otp: string };
    const result = await this.signupController.verifyOtp(email, otp);
    res.status(200).json(result);
  }

  async signup(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { email, password, otp, firstName, lastName } = req.body as {
      email: string; password: string; otp: string; firstName?: string; lastName?: string;
    };
    const result = await this.signupController.signup({ email, password, otp, firstName, lastName });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);
    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
    });
  }
}