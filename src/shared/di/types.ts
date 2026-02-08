export const TYPES = {
  // ======================
  // Repositories (Ports)
  // ======================
  UserRepositoryPort: Symbol.for('UserRepositoryPort'),
  RefreshTokenRepositoryPort: Symbol.for('RefreshTokenRepositoryPort'),
  InstructorApplicationRepositoryPort: Symbol.for(
  'InstructorApplicationRepositoryPort'
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
  ResetPasswordUseCase: Symbol.for('ResetPasswordUseCase'),
  GetCurrentUserUseCase: Symbol.for('GetCurrentUserUseCase'),
  RequestSignupOtpUseCase: Symbol.for('RequestSignupOtpUseCase'),
  VerifySignupOtpUseCase: Symbol.for('VerifySignupOtpUseCase'),
  RequestPasswordResetOtpUseCase: Symbol.for('RequestPasswordResetOtpUseCase'),
  VerifyPasswordResetOtpUseCase: Symbol.for('VerifyPasswordResetOtpUseCase'),
  CreateRefreshTokenUseCase: Symbol.for('CreateRefreshTokenUseCase'),
  RefreshAccessTokenUseCase: Symbol.for('RefreshAccessTokenUseCase'),
  RevokeRefreshTokenUseCase: Symbol.for('RevokeRefreshTokenUseCase'),
  LogoutUserUseCase: Symbol.for('LogoutUserUseCase'),

  // Instructor-related (add more later as needed)
  ApplyForInstructorUseCase: Symbol.for('ApplyForInstructorUseCase'),
  GetInstructorStatusUseCase: Symbol.for('GetInstructorStatusUseCase'),ListInstructorApplicationsUseCase: Symbol.for('ListInstructorApplicationsUseCase'),  // ← ADD
  ApproveInstructorApplicationUseCase: Symbol.for('ApproveInstructorApplicationUseCase'),  // ← ADD
  RejectInstructorApplicationUseCase: Symbol.for('RejectInstructorApplicationUseCase'),  // ← ADD

  // JwtAuthMiddleware: Symbol.for('JwtAuthMiddleware'),
  

  // ======================
  // Controllers
  // ======================
  AuthController: Symbol.for('AuthController'),
  InstructorController: Symbol.for('InstructorController'),

  // Profile
  GetProfileUseCase: Symbol.for('GetProfileUseCase'),
  UpdateProfileUseCase: Symbol.for('UpdateProfileUseCase'),
  UploadAvatarUseCase: Symbol.for('UploadAvatarUseCase'),
  DeleteAvatarUseCase: Symbol.for('DeleteAvatarUseCase'),
  ProfileController: Symbol.for('ProfileController'),
  
  // Storage
  StorageServicePort: Symbol.for('StorageServicePort'),
};
