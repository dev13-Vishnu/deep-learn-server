import { MongoUserRepository } from "../database/repositories/MongoUserRepository";
import { LoginUserUseCase } from "../../application/auth/login-user.usecase";
import { RegisterUserUseCase } from "../../application/auth/register-user.usecase";
import { OTPService } from "../../services/otp.service";
import { VerifySignupOtpUseCase } from "../../application/auth/verify-signup-otp.usecase";
import { RequestSignupOtpUseCase } from "../../application/auth/request-signup-otp.usecase";
import { OtpServiceAdapter } from "../services/OtpServiceAdapter";


const UserRepository = new MongoUserRepository();
const rawOtpService = new OTPService();
const otpService= new OtpServiceAdapter(rawOtpService);

export const loginUserUseCase = new LoginUserUseCase(UserRepository);
export const registerUserUseCase  = new RegisterUserUseCase(UserRepository);

export const verifySignupOtpUseCase = new VerifySignupOtpUseCase(otpService);

export const requestSignupOtpUseCase = new RequestSignupOtpUseCase(otpService);
