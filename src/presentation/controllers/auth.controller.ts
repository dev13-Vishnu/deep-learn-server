import { Request, Response } from "express";
import { RegisterUserUseCase } from "../../application/auth/register-user.usecase";
import { UserRepository } from "../../infrastructure/database/repositories/user.repository";
import { LoginUserUseCase } from "../../application/auth/login-user.usecase";
import { OTPService } from "../../services/otp.service";

export class AuthController{
    static async register (req: Request, res: Response) {
        const {email, password, role} = req.body;

        const userRepo = new UserRepository();
        const registerUser = new RegisterUserUseCase(userRepo);

        const result = await registerUser. execute({
            email,
            password,
            role
        });

        return res.status(201).json({
            message: 'User registered succesfully',
            user: result,
        })
    }
    
    static async login (req:Request, res: Response) {
        const {email, password} = req.body;

        const userRepo = new UserRepository();
        const loginUser  = new LoginUserUseCase(userRepo);

        const result = await loginUser. execute({email, password});

        return res.status(200).json({
            message:'Login successful',
            user: result.user,
            accessToken: result.accessToken,
        })
        

    }
    
  static async requestOtp(req: Request, res: Response) {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        message: "Email and purpose are required",
      });
    }

    if (!["signup", "forgot-password"].includes(purpose)) {
      return res.status(400).json({
        message: "Invalid OTP purpose",
      });
    }

    const otpService = new OTPService();
    const expiresAt = await otpService.sendOtp(email, purpose);

    return res.status(200).json({
      message: "OTP sent successfully",
      expiresAt,
    });
  }

  static async verifyOtpAndRegister(req: Request, res: Response) {
  const { email, otp, password, role } = req.body;

  if (!email || !otp || !password || !role) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  const otpService = new OTPService();

  // 1️⃣ Verify OTP first
  await otpService.verifyOtp(email, "signup", otp);

  // 2️⃣ Create user
  const userRepo = new UserRepository();
  const registerUser = new RegisterUserUseCase(userRepo);

  const user = await registerUser.execute({
    email,
    password,
    role,
  });

  return res.status(201).json({
    message: "Signup successful",
    user,
  });
}

}