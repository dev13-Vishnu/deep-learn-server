export interface EmailServicePort {
  sendOtp(to: string, otp: string, expiresInSeconds: number): Promise<void>;
}