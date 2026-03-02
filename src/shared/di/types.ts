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

  // Use Cases — Auth
  LoginUserUseCase: Symbol.for('LoginUserUseCase'),
  ResetPasswordUseCase: Symbol.for('ResetPasswordUseCase'),
  GetCurrentUserUseCase: Symbol.for('GetCurrentUserUseCase'),
  RequestSignupOtpUseCase: Symbol.for('RequestSignupOtpUseCase'),
  VerifySignupOtpUseCase: Symbol.for('VerifySignupOtpUseCase'),
  RequestPasswordResetOtpUseCase: Symbol.for('RequestPasswordResetOtpUseCase'),
  VerifyPasswordResetOtpUseCase: Symbol.for('VerifyPasswordResetOtpUseCase'),
  CreateRefreshTokenUseCase: Symbol.for('CreateRefreshTokenUseCase'),
  RefreshAccessTokenUseCase: Symbol.for('RefreshAccessTokenUseCase'),
  RevokeRefreshTokenUseCase: Symbol.for('RevokeRefreshTokenUseCase'),
  SignupUseCase: Symbol.for('SignupUseCase'),

  // Use Cases — Instructor
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

  // Use Cases — Profile
  GetProfileUseCase: Symbol.for('GetProfileUseCase'),
  UpdateProfileUseCase: Symbol.for('UpdateProfileUseCase'),
  UploadAvatarUseCase: Symbol.for('UploadAvatarUseCase'),
  DeleteAvatarUseCase: Symbol.for('DeleteAvatarUseCase'),

  // Use Cases — Course
  CreateCourseUseCase: Symbol.for('CreateCourseUseCase'),
  UpdateCourseUseCase: Symbol.for('UpdateCourseUseCase'),
  ListTutorCoursesUseCase: Symbol.for('ListTutorCoursesUseCase'),
  GetTutorCourseUseCase:   Symbol.for('GetTutorCourseUseCase'),
  DeleteCourseUseCase:     Symbol.for('DeleteCourseUseCase'),
  UploadThumbnailUseCase:   Symbol.for('UploadThumbnailUseCase'),
  PublishCourseUseCase:    Symbol.for('PublishCourseUseCase'),
  UnpublishCourseUseCase:  Symbol.for('UnpublishCourseUseCase'),
  ArchiveCourseUseCase:    Symbol.for('ArchiveCourseUseCase'),
  AddModuleUseCase:        Symbol.for('AddModuleUseCase'),
  UpdateModuleUseCase:     Symbol.for('UpdateModuleUseCase'),
  RemoveModuleUseCase:     Symbol.for('RemoveModuleUseCase'),
  ReorderModulesUseCase:   Symbol.for('ReorderModulesUseCase'),
  AddLessonUseCase:        Symbol.for('AddLessonUseCase'),
  UpdateLessonUseCase:     Symbol.for('UpdateLessonUseCase'),

  // Controllers
  AuthController: Symbol.for('AuthController'),
  LoginController: Symbol.for('LoginController'),
  SignupController: Symbol.for('SignupController'),
  PasswordResetController: Symbol.for('PasswordResetController'),
  InstructorController: Symbol.for('InstructorController'),
  ProfileController: Symbol.for('ProfileController'),
  CourseController: Symbol.for('CourseController'),

  // Storage
  StorageServicePort: Symbol.for('StorageServicePort'),

  // Ports — split interfaces
  UserReaderPort: Symbol.for('UserReaderPort'),
  UserWriterPort: Symbol.for('UserWriterPort'),

  // Ports — Course
  CourseRepositoryPort: Symbol.for('CourseRepositoryPort'),

  // OAuth
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