export const PRESENTATION_TYPES = {
  // Controllers
  LoginController:           Symbol.for('LoginController'),
  SignupController:          Symbol.for('SignupController'),
  OAuthController:           Symbol.for('OAuthController'),
  PasswordResetController:   Symbol.for('PasswordResetController'),
  ProfileController:         Symbol.for('ProfileController'),
  CourseController:          Symbol.for('CourseController'),
  InstructorController:      Symbol.for('InstructorController'),

  // Http Adapters
  AuthHttpAdapter:           Symbol.for('AuthHttpAdapter'),
  SignupHttpAdapter:         Symbol.for('SignupHttpAdapter'),
  OAuthHttpAdapter:          Symbol.for('OAuthHttpAdapter'),
  ProfileHttpAdapter:        Symbol.for('ProfileHttpAdapter'),
  CourseHttpAdapter:         Symbol.for('CourseHttpAdapter'),
  InstructorHttpAdapter:     Symbol.for('InstructorHttpAdapter'),
};