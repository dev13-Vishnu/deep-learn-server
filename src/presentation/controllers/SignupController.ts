import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RegisterUserUseCase } from '../../application/auth/RegisterUserUseCase';
import { RequestSignupOtpUseCase } from '../../application/auth/RequestSignupOtpUseCase';
import { VerifySignupOtpUseCase } from '../../application/auth/VerifySignupOtpUseCase';

@injectable()
export class SignupController {
  constructor(
    @inject(TYPES.RegisterUserUseCase)
    private registerUserUseCase: RegisterUserUseCase,
    @inject(TYPES.RequestSignupOtpUseCase)
    private requestSignupOtpUseCase: RequestSignupOtpUseCase,
    @inject(TYPES.VerifySignupOtpUseCase)
    private verifySignupOtpUseCase: VerifySignupOtpUseCase
  ) {}

  async requestOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      
      // RequestSignupOtpUseCase returns a Date directly, not an object with expiresAt property
      const expiresAt = await this.requestSignupOtpUseCase.execute(email);

      res.status(200).json({
        message: 'OTP sent to email',
        expiresAt, // This is already a Date object
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, otp } = req.body;
      await this.verifySignupOtpUseCase.execute(email, otp);

      res.status(200).json({
        message: 'OTP verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, otp } = req.body;

      // Verify OTP first
      await this.verifySignupOtpUseCase.execute(email, otp);

      // Register user (returns User entity, not a structured DTO)
      const user = await this.registerUserUseCase.execute({
        email,
        password,
      });

      // Return simple success response
      // Note: In your actual codebase, auth.controller handles token generation differently
      res.status(201).json({
        message: 'User registered successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  }
}