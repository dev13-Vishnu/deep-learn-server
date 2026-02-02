export const TYPES = {
  // Repositories
  UserRepositoryPort: Symbol.for("UserRepositoryPort"),
  RefreshTokenRepositoryPort: Symbol.for("RefreshTokenRepositoryPort"),
  InstructorApplicationRepository: Symbol.for("InstructorApplicationRepository"),

  // Services
  PasswordHasherPort: Symbol.for("PasswordHasherPort"),
  TokenServicePort: Symbol.for("TokenServicePort"),
  OtpServicePort: Symbol.for("OtpServicePort"),

  // Auth use cases
  LoginUserUseCase: Symbol.for("LoginUserUseCase"),
  RegisterUserUseCase: Symbol.for("RegisterUserUseCase"),
  GetCurrentUserUseCase: Symbol.for("GetCurrentUserUseCase"),
  RequestSignupOtpUseCase: Symbol.for("RequestSignupOtpUseCase"),
  VerifySignupOtpUseCase: Symbol.for("VerifySignupOtpUseCase"),
  RequestPasswordResetOtpUseCase: Symbol.for("RequestPasswordResetOtpUseCase"),
  VerifyPasswordResetOtpUseCase: Symbol.for("VerifyPasswordResetOtpUseCase"),
  ResetPasswordUseCase: Symbol.for("ResetPasswordUseCase"),
  CreateRefreshTokenUseCase: Symbol.for("CreateRefreshTokenUseCase"),
  RefreshAccessTokenUseCase: Symbol.for("RefreshAccessTokenUseCase"),
  RevokeRefreshTokenUseCase: Symbol.for("RevokeRefreshTokenUseCase"),

  // Instructor
  ApplyForInstructorUseCase: Symbol.for("ApplyForInstructorUseCase"),
  GetInstructorStatusUseCase: Symbol.for("GetInstructorStatusUseCase"),

  // Controllers
  AuthController: Symbol.for("AuthController"),
  InstructorController: Symbol.for("InstructorController"),
};
