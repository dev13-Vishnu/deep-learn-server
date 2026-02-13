// import { Request, Response, NextFunction } from 'express';
// import { inject, injectable } from 'inversify';
// import { TYPES } from '../../shared/di/types';
// import { RegisterUserUseCase } from '../../application/auth/RegisterUserUseCase';
// import { RequestSignupOtpUseCase } from '../../application/auth/RequestSignupOtpUseCase';
// import { VerifySignupOtpUseCase } from '../../application/auth/VerifySignupOtpUseCase';
// import { TokenServicePort } from '../../application/ports/TokenServicePort';
// import { CreateRefreshTokenUseCase } from '../../application/auth/CreateRefreshTokenUseCase';
// import { AppError } from '../../shared/errors/AppError';


// @injectable()
// export class SignupController {
//   constructor(
//     @inject(TYPES.RegisterUserUseCase)
//     private registerUserUseCase: RegisterUserUseCase,

//     @inject(TYPES.RequestSignupOtpUseCase)
//     private requestSignupOtpUseCase: RequestSignupOtpUseCase,

//     @inject(TYPES.VerifySignupOtpUseCase)
//     private verifySignupOtpUseCase: VerifySignupOtpUseCase,

//     @inject(TYPES.TokenServicePort)
//     private tokenService: TokenServicePort,

//     @inject(TYPES.CreateRefreshTokenUseCase)
//     private createRefreshTokenUseCase: CreateRefreshTokenUseCase
//   ) {}

//   async requestOtp(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { email } = req.body;
      
//       // RequestSignupOtpUseCase returns a Date directly
//       const expiresAt = await this.requestSignupOtpUseCase.execute(email);

//       res.status(200).json({
//         message: 'OTP sent to email',
//         expiresAt,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async verifyOtp(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { email, otp } = req.body;
//       await this.verifySignupOtpUseCase.execute(email, otp);

//       res.status(200).json({
//         message: 'OTP verified successfully',
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async signup(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { email, password, otp,firstName, lastName } = req.body;

//       // 1. Verify OTP first
//       await this.verifySignupOtpUseCase.execute(email, otp);

//           // console.log(firstName, lastName)

//       // 2. Register user (returns User entity)
//       const user = await this.registerUserUseCase.execute({
//         email,
//         password,
//         firstName,
//         lastName
//       });

//       // 3. Type safety check - ensure user.id exists
//       if (!user.id) {
//         throw new AppError('User registration failed: No user ID generated', 500);
//       }

//       // 4. Generate access token
//       const accessToken = this.tokenService.generateAccessToken({
//         userId: user.id, // Now TypeScript knows this is string, not string | undefined
//         role: user.role,
//       });

//       // 5. Create refresh token
//       const {token} = await this.createRefreshTokenUseCase.execute(user.id);

//       // 6. Set refresh token as HTTP-only cookie (same as login)
//       res.cookie('refreshToken', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       });

//       // 7. Return success response with tokens
//       res.status(201).json({
//         message: 'User registered successfully',
//         user,
//         accessToken,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { RequestSignupOtpUseCase } from "../../application/auth/RequestSignupOtpUseCase";
import { VerifySignupOtpUseCase } from "../../application/auth/VerifySignupOtpUseCase";
import { SignupUseCase } from "../../application/auth/SignupUseCase";
import { Request , Response} from "express";
import { env } from "../../shared/config/env";
import { authConfig } from "../../shared/config/auth.config";

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

    res.cookie('refreshToken', result.refreshToken,{
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: authConfig.refreshToken.expiresInMs,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
    })
  }
}