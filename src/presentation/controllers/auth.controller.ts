import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { TYPES } from "../../shared/di/types";

import { LoginUserUseCase } from "../../application/auth/LoginUserUseCase";
import { GetCurrentUserUseCase } from "../../application/auth/GetCurrentUserUseCase";
import { RegisterUserUseCase } from "../../application/auth/RegisterUserUseCase";

import { RequestSignupOtpUseCase } from "../../application/auth/RequestSignupOtpUseCase";
import { VerifySignupOtpUseCase } from "../../application/auth/VerifySignupOtpUseCase";

import { RequestPasswordResetOtpUseCase } from "../../application/auth/RequestPasswordResetOtpUseCase";
import { VerifyPasswordResetOtpUseCase } from "../../application/auth/VerifyPasswordResetOtpUseCase";
import { ResetPasswordUseCase } from "../../application/auth/ResetPasswordUseCase";

import { CreateRefreshTokenUseCase } from "../../application/auth/CreateRefreshTokenUseCase";
import { RefreshAccessTokenUseCase } from "../../application/auth/RefreshAccessTokenUseCase";
import { RevokeRefreshTokenUseCase } from "../../application/auth/RevokeRefreshTokenUseCase";

import { AuthenticatedRequest } from "../../infrastructure/security/jwt-auth.middleware";
import { CookieHelper } from "../utils/cookie.helper";
import { authConfig } from "../../shared/config/auth.config";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase,

    @inject(TYPES.RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,

    @inject(TYPES.GetCurrentUserUseCase)
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,

    @inject(TYPES.RequestSignupOtpUseCase)
    private readonly requestSignupOtpUseCase: RequestSignupOtpUseCase,

    @inject(TYPES.VerifySignupOtpUseCase)
    private readonly verifySignupOtpUseCase: VerifySignupOtpUseCase,

    @inject(TYPES.RequestPasswordResetOtpUseCase)
    private readonly requestPasswordResetOtpUseCase: RequestPasswordResetOtpUseCase,

    @inject(TYPES.VerifyPasswordResetOtpUseCase)
    private readonly verifyPasswordResetOtpUseCase: VerifyPasswordResetOtpUseCase,

    @inject(TYPES.ResetPasswordUseCase)
    private readonly resetPasswordUseCase: ResetPasswordUseCase,

    @inject(TYPES.CreateRefreshTokenUseCase)
    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,

    @inject(TYPES.RefreshAccessTokenUseCase)
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,

    @inject(TYPES.RevokeRefreshTokenUseCase)
    private readonly revokeRefreshTokenUseCase: RevokeRefreshTokenUseCase
  ) {}

  /* ================= LOGIN ================= */

  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const { user, accessToken } =
      await this.loginUserUseCase.execute({ email, password });

    if (!user.id) {
      throw new Error('User ID missing after login');
    }

    const { token: refreshToken } =
      await this.createRefreshTokenUseCase.execute(user.id);

    CookieHelper.setRefreshTokenCookie(
      res,
      refreshToken,
      authConfig.refreshToken.expiresInMs
    );

    return res.status(200).json({
      message: 'Login successful',
      user,
      accessToken,
    });
  }

  /* ================= SIGNUP ================= */

  async requestSignupOtp(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    const expiresAt =
      await this.requestSignupOtpUseCase.execute(email);

    return res.status(200).json({
      message: 'OTP sent successfully',
      expiresAt,
    });
  }

  async signup(req: Request, res: Response): Promise<Response> {
    const { email, otp, password } = req.body;

    await this.verifySignupOtpUseCase.execute(email, otp);

    const user = await this.registerUserUseCase.execute({
      email,
      password,
    });

    if (!user.id) {
      throw new Error('User ID missing');
    }

    // Generate access token via login use case
    const { accessToken } = await this.loginUserUseCase.execute({
      email,
      password,
    });

    const { token: refreshToken } =
      await this.createRefreshTokenUseCase.execute(user.id);

    CookieHelper.setRefreshTokenCookie(
      res,
      refreshToken,
      authConfig.refreshToken.expiresInMs
    );

    return res.status(201).json({
      message: 'Signup successful',
      user,
      accessToken,
    });
  }

  /* ================= PASSWORD RESET ================= */

  async requestPasswordResetOtp(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    await this.requestPasswordResetOtpUseCase.execute(email);

    return res.status(200).json({
      message: 'If the email exists, an OTP has been sent',
    });
  }

  async verifyPasswordResetOtp(req: Request, res: Response): Promise<Response> {
    const { email, otp } = req.body;

    await this.verifyPasswordResetOtpUseCase.execute(email, otp);

    return res.status(200).json({
      message: 'OTP verified successfully',
    });
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    await this.resetPasswordUseCase.execute(email, password);

    return res.status(200).json({
      message: 'Password reset successful',
    });
  }

  /* ================= AUTH SESSION ================= */

  async me(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const user = await this.getCurrentUserUseCase.execute(
      authReq.user!.userId
    );

    return res.status(200).json({ user });
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    const refreshToken = CookieHelper.getRefreshToken(req);

    if (!refreshToken) {
      return res.status(401).json({ message: 'Missing refresh token' });
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await this.refreshAccessTokenUseCase.execute(refreshToken);

    CookieHelper.setRefreshTokenCookie(
      res,
      newRefreshToken,
      authConfig.refreshToken.expiresInMs
    );

    return res.status(200).json({ accessToken });
  }

  async logout(req: Request, res: Response): Promise<Response> {
    const refreshToken = CookieHelper.getRefreshToken(req);

    if (refreshToken) {
      await this.revokeRefreshTokenUseCase.execute(refreshToken);
    }

    CookieHelper.clearRefreshTokenCookie(res);

    return res.status(200).json({ message: 'Logged out' });
  }
}
