export type OtpPurpose = 'signup' | 'forgot-password'

export interface OtpServicePort {
    send(email: string, purpose: OtpPurpose): Promise <Date>;
    verify(email: string, purpose: OtpPurpose, otp: string): Promise<void>;
}