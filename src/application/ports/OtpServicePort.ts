export type OtpPurpose = 'signup' | 'forgot-password';

export interface OtpServicePort {
  requestOtp(email: string, purpose: OtpPurpose): Promise<Date>;
  verifyOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void>;
}
