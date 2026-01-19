import { Request, Response } from "express";
import { OTPService } from "../../services/otp.service";
import { loginUserUseCase, registerUserUseCase } from "../../infrastructure/di/auth.di";

export class AuthController{
    static async register (req: Request, res: Response) {
        const {email, password } = req.body;

        const result = await registerUserUseCase. execute({
            email,
            password
        });

        return res.status(201).json({
            message: 'User registered succesfully',
            user: result,
        })
    }
    
    static async login (req:Request, res: Response) {
        const {email, password} = req.body;

        const result = await loginUserUseCase. execute({email, password});

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
  const { email, otp, password  } = req.body;

  if (!email || !otp || !password ) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  const otpService = new OTPService();

  // 1️⃣ Verify OTP first
  await otpService.verifyOtp(email, "signup", otp);

  // 2️⃣ Create user
  const user = await registerUserUseCase.execute({
    email,
    password
  });

  return res.status(201).json({
    message: "Signup successful",
    user,
  });
}

}