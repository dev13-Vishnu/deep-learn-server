// No application-class imports. Symbol constants only.

export const TYPES = {
  // Repositories (Ports)
  UserRepositoryPort: Symbol.for('UserRepositoryPort'),
  RefreshTokenRepositoryPort: Symbol.for('RefreshTokenRepositoryPort'),
  InstructorApplicationRepositoryPort: Symbol.for(
    'InstructorApplicationRepositoryPort'
  ),

  // Services (Ports)
  OtpServicePort: Symbol.for('OtpServicePort'),
  PasswordHasherPort: Symbol.for('PasswordHasherPort'),
  TokenServicePort: Symbol.for('TokenServicePort'),

  // Use Cases
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

  // Instructor
  ApplyForInstructorUseCase: Symbol.for('ApplyForInstructorUseCase'),
  GetInstructorStatusUseCase: Symbol.for('GetInstructorStatusUseCase'),
  ListInstructorApplicationsUseCase: Symbol.for(
    'ListInstructorApplicationsUseCase'
  ),
  ApproveInstructorApplicationUseCase: Symbol.for(
    'ApproveInstructorApplicationUseCase'
  ),
  RejectInstructorApplicationUseCase: Symbol.for(
    'RejectInstructorApplicationUseCase'
  ),

  // Controllers
  AuthController: Symbol.for('AuthController'),
  LoginController: Symbol.for('LoginController'),
  SignupController: Symbol.for('SignupController'),
  PasswordResetController: Symbol.for('PasswordResetController'),
  InstructorController: Symbol.for('InstructorController'),
  ProfileController: Symbol.for('ProfileController'),

  // Profile
  GetProfileUseCase: Symbol.for('GetProfileUseCase'),
  UpdateProfileUseCase: Symbol.for('UpdateProfileUseCase'),
  UploadAvatarUseCase: Symbol.for('UploadAvatarUseCase'),
  DeleteAvatarUseCase: Symbol.for('DeleteAvatarUseCase'),

  // Storage
  StorageServicePort: Symbol.for('StorageServicePort'),

  UserReaderPort: Symbol.for('UserReaderPort'),
  UserWriterPort: Symbol.for('UserWriterPort'),
  SignupUseCase: Symbol.for('SignupUseCase'),

  OAuthConnectionRepositoryPort: Symbol.for('OAuthConnectionRepositoryPort'),
  OAuthStateStorePort: Symbol.for('OAuthStateStorePort'),
  OAuthProviderRegistry: Symbol.for('OAuthProviderRegistry'),
  InitiateOAuthUseCase: Symbol.for('InitiateOAuthUseCase'),
  HandleOAuthCallbackUseCase: Symbol.for('HandleOAuthCallbackUseCase'),
  OAuthController: Symbol.for('OAuthController'),
  GoogleOAuthAdapter: Symbol.for('GoogleOAuthAdapter'),
  FacebookOAuthAdapter: Symbol.for('FacebookOAuthAdapter'),
  MicrosoftOAuthAdapter: Symbol.for('MicrosoftOAuthAdapter'),
};