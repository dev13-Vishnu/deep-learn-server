import { MongoUserRepository } from "../database/repositories/MongoUserRepository";
import { LoginUserUseCase } from "../../application/auth/login-user.usecase";
import { RegisterUserUseCase } from "../../application/auth/register-user.usecase";
import { OTPService } from "../../services/otp.service";
import { VerifySignupOtpUseCase } from "../../application/auth/verify-signup-otp.usecase";
import { RequestSignupOtpUseCase } from "../../application/auth/request-signup-otp.usecase";
import { OtpServiceAdapter } from "../services/OtpServiceAdapter";
import { RequestPasswordResetOtpUseCase } from "../../application/auth/request-password-reset-otp.usecase";
import { VerifyPasswordResetOtpUseCase } from "../../application/auth/verify-password-reset-otp.usecase";


const userRepository = new MongoUserRepository();
const rawOtpService = new OTPService();
const otpServiceAdapter= new OtpServiceAdapter(rawOtpService);

export const loginUserUseCase = new LoginUserUseCase(userRepository);
export const registerUserUseCase  = new RegisterUserUseCase(userRepository);

export const verifySignupOtpUseCase = new VerifySignupOtpUseCase(otpServiceAdapter);

export const requestSignupOtpUseCase = new RequestSignupOtpUseCase(otpServiceAdapter);

export const requestPasswordResetOtpUseCase = new RequestPasswordResetOtpUseCase(
    userRepository,
    otpServiceAdapter
)

export const verifyPasswordResetOtpUseCase = new VerifyPasswordResetOtpUseCase (otpServiceAdapter);
