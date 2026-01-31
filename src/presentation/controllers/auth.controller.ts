import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { RefreshTokenModel } from "../../infrastructure/database/models/RefreshTokenModel";
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

    await this.verifySignupOtpUseCase.execute(email, otp);

    const user =
      await this.registerUserUseCase.execute({ email, password });
    
    if(!user.id){
      throw new Error('User ID missng');
    }

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

//    async signup(req:Request, res:Response) {
//     const {email, otp, password} = req.body;

//     if(!email || !otp || !password) {
//       return res.status(400).json({
//         message: 'Missing required fields',
//       });
//     }
    
//     //1. verify OTP
//     await verifySignupOtpUseCase.execute(email, otp);

//     //2. Register user
//     const user = await registerUserUseCase.execute({
//       email, 
//       password
//     });
//     if(!user.id) {
//       throw new Error('User identity not initialized');
//     }

//     const accessToken = JwtService.sign({
//       userId:user.id,
//       role: user.role,
//     });

//       const result = await loginUserUseCase. execute({email, password});

//       const refreshToken = JwtService.generateRefreshToken();
//       const refreshTokenHash = JwtService.hashToken(refreshToken);

//       await RefreshTokenModel.create({
//         userId: user.id,
//         tokenHash: refreshTokenHash,
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//       })

//       res.cookie('refreshToken', refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         path: '/auth/refresh',
//       });


//     return res.status (201).json({
//       message: 'Signup successful',
//       user:{
//         id: user.id,
//         email: user.email.getValue(),
//         role: user.role,
//       },
//       accessToken,
//     });
    
//   }
    
//    async login (req:Request, res: Response): Promise<Response> {
//       const {email, password} = req.body;

//       const result = await loginUserUseCase. execute({email, password});

//       const refreshToken = JwtService.generateRefreshToken();
//       const refreshTokenHash = JwtService.hashToken(refreshToken);

//       await RefreshTokenModel.create({
//         userId: result.user.id,
//         tokenHash: refreshTokenHash,
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//       })

//       res.cookie('refreshToken', refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         path: '/auth/refresh',
//       });

//       return res.status(200).json({
//           message:'Login successful',
//           user: result.user,
//           accessToken: result.accessToken,
//       })
      

//   }
    
//    async requestOtp(req: Request, res: Response) {
//     const { email, purpose } = req.body;

//     if (!email || !purpose) {
//       return res.status(400).json({
//         message: "Email and purpose are required",
//       });
//     }

//     if (!["signup", "forgot-password"].includes(purpose)) {
//       return res.status(400).json({
//         message: "Invalid OTP purpose",
//       });
//     }

//     const expiresAt = await requestSignupOtpUseCase.execute(email);

//     return res.status(200).json({
//       message: "OTP sent successfully",
//       expiresAt,
//     });
//   }
//    async requestPasswordResetOtp(req: Request, res:Response) {
//     const { email }= req.body;
//     if(!email) {
//       return res.status(400).json({
//         message:'Email is required',
//       });
//     }
//     await  requestPasswordResetOtpUseCase.execute(email);

//     return res.status(200).json({
//       message: "If the email exists, an OTP has been sent",
//     });
//   }

//    async verifyPasswordResetOtp(req: Request, res: Response) {
//     const  {email, otp} = req.body;

//     if(!email || !otp) {
//       return res.status(400).json({
//         message: "Email and OTP are required",
//       });
//     }
//     await verifyPasswordResetOtpUseCase.execute(email, otp);

//     return res.status(200).json( {
//       message:"OTP verified succesfully",
//     })
    
//   }

//    async resetPassword(req: Request, res: Response) {
//     const {email, password}= req.body;

//     if(!email || !password) {
//       return res.status(400).json({
//         message: "Email and new password are required",
//       });
//     }

//     await resetPasswordUseCase.execute(email, password);

//     return res.status(200).json({
//       message: "Password reset successful",
//     })
//   }

//    async me (req: Request, res: Response) {
//     const authReq = req as AuthenticatedRequest;

//     if(!authReq.user) {
//       return res.status(401).json({message: "Unauthorized"});
//     }
//     const user = await getCurrentUserUseCase.execute(
//       authReq.user.userId
//     );
//     return res.status(200).json({user});
//   }

//  async refresh(req: Request, res: Response) {
//   const token = req.cookies?.refreshToken;

//   if (!token) {
//     return res.status(401).json({ message: 'Missing refresh token' });
//   }

//   const tokenHash = JwtService.hashToken(token);

//   const stored = await RefreshTokenModel.findOne({
//     tokenHash,
//     revoked: false,
//     expiresAt: { $gt: new Date() },
//   });

//   if (!stored) {
//     return res.status(401).json({ message: 'Invalid refresh token' });
//   }

//   // rotate
//   stored.revoked = true;
//   await stored.save();

//   const newRefreshToken = JwtService.generateRefreshToken();
//   const newHash = JwtService.hashToken(newRefreshToken);

//   await RefreshTokenModel.create({
//     userId: stored.userId,
//     tokenHash: newHash,
//     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//   });

//   const user = await getCurrentUserUseCase.execute(
//   stored.userId.toString()
// );

// if (!user.id) {
//   throw new Error('User ID missing during token refresh');
// }

// const accessToken = JwtService.sign({
//   userId: user.id,
//   role: user.role,
// });



//   res.cookie('refreshToken', newRefreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict',
//     path: '/auth/refresh',
//   });

//   return res.status(200).json({ accessToken });
// }


//  async logout(req: Request, res: Response) {
//   const token = req.cookies?.refreshToken;

//   if (token) {
//     const hash = JwtService.hashToken(token);
//     await RefreshTokenModel.updateOne(
//       { tokenHash: hash },
//       { revoked: true }
//     );
//   }

//   res.clearCookie('refreshToken', {
//     path: '/auth/refresh',
//   });

//   return res.status(200).json({ message: 'Logged out' });
// }




}