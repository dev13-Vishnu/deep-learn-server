export const TYPES = {
  // ======================
  // Repositories (Ports)
  // ======================
  UserRepositoryPort: Symbol.for('UserRepositoryPort'),
  RefreshTokenRepositoryPort: Symbol.for('RefreshTokenRepositoryPort'),
  InstructorApplicationRepository: Symbol.for(
  'InstructorApplicationRepository'
),

  // ======================
  // Services (Ports)
  // ======================
  OtpServicePort: Symbol.for('OtpServicePort'),
  PasswordHasherPort: Symbol.for('PasswordHasherPort'),
  TokenServicePort: Symbol.for('TokenServicePort'),

  // ======================
  // Use Cases
  // ======================
  LoginUserUseCase: Symbol.for('LoginUserUseCase'),
  RegisterUserUseCase: Symbol.for('RegisterUserUseCase'),
  RequestSignupOtpUseCase: Symbol.for('RequestSignupOtpUseCase'),
  VerifySignupOtpUseCase: Symbol.for('VerifySignupOtpUseCase'),
  LogoutUserUseCase: Symbol.for('LogoutUserUseCase'),

  // Instructor-related (add more later as needed)
  ApplyInstructorUseCase: Symbol.for('ApplyInstructorUseCase'),
  

  // ======================
  // Controllers
  // ======================
  AuthController: Symbol.for('AuthController'),
  InstructorController: Symbol.for('InstructorController'),
};
