import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RequestSignupOtpUseCase } from '../../application/auth/RequestSignupOtpUseCase';
import { VerifySignupOtpUseCase } from '../../application/auth/VerifySignupOtpUseCase';
import { RegisterUserUseCase } from '../../application/auth/RegisterUserUseCase';

@injectable()
export class SignupController {
  constructor(
    @inject(TYPES.RequestSignupOtpUseCase)
    private readonly requestSignupOtpUseCase: RequestSignupOtpUseCase,

    @inject(TYPES.VerifySignupOtpUseCase)
    private readonly verifySignupOtpUseCase: VerifySignupOtpUseCase,

    @inject(TYPES.RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase
  ) {}

  async requestOtp(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    const result = await this.requestSignupOtpUseCase.execute(email);

    return res.status(200).json({
      message: 'OTP sent successfully',
      expiresAt: result.expiresAt,
    });
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const { email, otp } = req.body;

    await this.verifySignupOtpUseCase.execute(email, otp);

    return res.status(200).json({
      message: 'OTP verified successfully',
    });
  }

  async signup(req: Request, res: Response): Promise<Response> {
    const { email, otp, password } = req.body;

    const result = await this.registerUserUseCase.execute({
      email,
      otp,
      password,
    });

    // Set refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
    });
  }
}