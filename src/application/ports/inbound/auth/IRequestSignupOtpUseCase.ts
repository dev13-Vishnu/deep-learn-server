export interface IRequestSignupOtpUseCase {
  execute(email: string): Promise<Date>;
}