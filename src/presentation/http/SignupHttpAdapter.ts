import { injectable, inject } from 'inversify';
import { HttpRequest, HttpResponse } from './HttpContext';
import { SignupController } from '../controllers/SignupController';
import { env } from '../../shared/config/env';
import { authConfig } from '../../shared/config/auth.config';
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
    const isCrossSite = env.isProduction || env.isTunnel;
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure:   isCrossSite,
      sameSite: isCrossSite ? 'none' : 'lax',
      maxAge:   authConfig.refreshToken.expiresInMs,
    });
    res.status(201).json({ message: 'User registered successfully', user: result.user, accessToken: result.accessToken });
  }
}