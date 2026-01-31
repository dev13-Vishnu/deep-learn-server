import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { TYPES } from "../../shared/di/types";

import { LoginUserUseCase } from "../../application/auth/LoginUser.usecase";
import { GetCurrentUserUseCase } from "../../application/auth/GetCurrentUser.usecase";
import { RegisterUserUseCase } from "../../application/auth/RegisterUser.usecase";

import { RequestSignupOtpUseCase } from "../../application/auth/RequestSignupOtp.usecase";
import { VerifySignupOtpUseCase } from "../../application/auth/VerifySignupOtp.usecase";

import { RequestPasswordResetOtpUseCase } from "../../application/auth/RequestPasswordResetOtp.usecase";
import { VerifyPasswordResetOtpUseCase } from "../../application/auth/VerifyPasswordResetOtp.usecase";
import { ResetPasswordUseCase } from "../../application/auth/ResetPassword.usecase";

import { CreateRefreshTokenUseCase } from "../../application/auth/CreateRefreshToken.usecase";
import { RefreshAccessTokenUseCase } from "../../application/auth/RefreshAccessToken.usecase";
import { RevokeRefreshTokenUseCase } from "../../application/auth/RevokeRefreshToken.usecase";

import { AuthenticatedRequest } from "../../infrastructure/security/jwt-auth.middleware";
import { CookieHelper } from "../utils/cookie.helper";
import { authConfig } from "../../shared/config/auth.config";

@injectable()
export class AuthController{
  constructor (
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
  ){}

  /* ================= LOGIN ================= */

  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const { user, accessToken } =
      await this.loginUserUseCase.execute({ email, password });

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

    if(!email || !otp || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    //Verify OTP
    await this.verifySignupOtpUseCase.execute(email, otp);

    //Register user
    const user =
      await this.registerUserUseCase.execute({
        email,
        password,
      });
    
    if(!user.id){
      throw new Error('User ID missng');
    }

    //Generate access token via login use cas (NO duplicate login logic)
    const { accessToken } = await this.loginUserUseCase.execute({
      email,
      password,
    })

    //create refresh token
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

  async requestPasswordResetOtp(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { email } = req.body;

    await this.requestPasswordResetOtpUseCase.execute(email);

    return res.status(200).json({
      message: 'If the email exists, an OTP has been sent',
    });
  }

  async verifyPasswordResetOtp(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { email, otp } = req.body;

    await this.verifyPasswordResetOtpUseCase.execute(email, otp);

    return res.status(200).json({
      message: 'OTP verified successfully',
    });
  }

  async resetPassword(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { email, password } = req.body;

    await this.resetPasswordUseCase.execute(email, password);

    return res.status(200).json({
      message: 'Password reset successful',
    });
  }

  /* ================= AUTH SESSION ================= */

  async me(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const user =
      await this.getCurrentUserUseCase.execute(
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
      refreshToken: newRefreshToken
    } =
      await this.refreshAccessTokenUseCase.execute(refreshToken);

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