import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { RequestSignupOtpUseCase } from "../../application/auth/RequestSignupOtpUseCase";
import { VerifySignupOtpUseCase } from "../../application/auth/VerifySignupOtpUseCase";
import { SignupUseCase } from "../../application/auth/SignupUseCase";
import { Request , Response} from "express";
import { authConfig } from "../../shared/config/auth.config";
import { env } from "../../shared/config/env";

@injectable()
export class SignupController {
  constructor (
    @inject (TYPES.RequestSignupOtpUseCase)
    private readonly requestSignupOtpUseCase: RequestSignupOtpUseCase,

    @inject(TYPES.VerifySignupOtpUseCase)
    private readonly verifySignupOtpUseCase: VerifySignupOtpUseCase,

    @inject(TYPES.SignupUseCase)
    private readonly signupUseCase: SignupUseCase,
  ) {}

  async requestOtp (req: Request, res: Response): Promise <Response> {
    const { email } = req.body;
    const expiresAt = await this.requestSignupOtpUseCase.execute(email);

    return res.status(200).json({
      message: 'OTP sent to email',
      expiresAt,
    });
  }

  async verifyOtp(req: Request, res: Response) :Promise<Response> {
    const { email, otp } = req.body;
    await this.verifySignupOtpUseCase.execute(email,otp);

    return res.status(200).json({
      message: 'OTP verified successfully',
    })
  }
  
  async signup(req: Request, res: Response) {
    const { email, password, otp, firstName, lastName } = req.body;

    const result = await this.signupUseCase.execute({
      email,
      password,
      otp,
      firstName,
      lastName,
    });

    const isCrossSite = env.isProduction || env.isTunnel;

    res.cookie('refreshToken', result.refreshToken,{
      httpOnly: true,
      secure: isCrossSite,
      sameSite: isCrossSite ? 'none' : 'lax',
      maxAge: authConfig.refreshToken.expiresInMs,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
    })
  }
}