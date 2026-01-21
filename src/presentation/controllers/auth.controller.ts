import { Request, Response } from "express";
import { loginUserUseCase, registerUserUseCase, requestPasswordResetOtpUseCase, requestSignupOtpUseCase, verifySignupOtpUseCase } from "../../infrastructure/di/auth.di";
import { JwtService } from "../../infrastructure/security/jwt.services";

export class AuthController{
  // static async register (req: Request, res: Response) {
  //     const {email, password } = req.body;

  //     const result = await registerUserUseCase. execute({
  //         email,
  //         password
  //     });

  //     return res.status(201).json({
  //         message: 'User registered succesfully',
  //         user: result,
  //     })
  // }

  static async signup(req:Request, res:Response) {
    const {email, otp, password} = req.body;

    if(!email || !otp || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }
    
    //1. verify OTP
    await verifySignupOtpUseCase.execute(email, otp);

    //2. Register user
    const user = await registerUserUseCase.execute({
      email, 
      password
    });
    if(!user.id) {
      throw new Error('User identity not initialized');
    }

    const accessToken = JwtService.sign({
      userId:user.id,
      role: user.role,
    });

    return res.status (201).json({
      message: 'Signup successful',
      user:{
        id: user.id,
        email: user.email.getValue(),
        role: user.role,
      },
      accessToken,
    });
    
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

    const expiresAt = await requestSignupOtpUseCase.execute(email);

    return res.status(200).json({
      message: "OTP sent successfully",
      expiresAt,
    });
  }
  static async requestPasswordResetOtp(req: Request, res:Response) {
    const { email }= req.body;
    if(!email) {
      return res.status(400).json({
        message:'Email is required',
      });
    }
    await  requestPasswordResetOtpUseCase.execute(email);

    return res.status(200).json({
      message: "If the email exists, an OTP has been sent",
    });
  }


//   static async verifyOtpAndRegister(req: Request, res: Response) {
//   const { email, otp, password  } = req.body;

//   if (!email || !otp || !password ) {
//     return res.status(400).json({
//       message: "Missing required fields",
//     });
//   }

//   const otpService = new OTPService();

//   // 1️⃣ Verify OTP first
//   await otpService.verifyOtp(email, "signup", otp);

//   // 2️⃣ Create user
//   const user = await registerUserUseCase.execute({
//     email,
//     password
//   });

//   return res.status(201).json({
//     message: "Signup successful",
//     user,
//   });
// }

}