export interface IVerifyPasswordResetOtpUseCase {
  execute(email: string, otp: string): Promise<void>;
}