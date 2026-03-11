export interface IRequestPasswordResetOtpUseCase {
  execute(email: string): Promise<void>;
}