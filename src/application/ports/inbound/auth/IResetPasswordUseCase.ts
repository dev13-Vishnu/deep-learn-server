export interface IResetPasswordUseCase {
  execute(emailRaw: string, newPasswordRaw: string): Promise<void>;
}