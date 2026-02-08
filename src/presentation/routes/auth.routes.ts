import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { LoginController } from '../controllers/LoginController';
import { SignupController } from '../controllers/SignupController';
import { PasswordResetController } from '../controllers/PasswordResetController';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { validateRequest } from '../middlewares/validationRequest';
import {
  loginSchema,
  signupSchema,
  requestOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '../validators/auth.validators';

const router = Router();

// Get controllers
const loginController = container.get<LoginController>(TYPES.LoginController);
const signupController = container.get<SignupController>(TYPES.SignupController);
const passwordResetController = container.get<PasswordResetController>(
  TYPES.PasswordResetController
);

// ==================== LOGIN ====================
router.post(
  '/login',
  validateRequest(loginSchema),
  loginController.login.bind(loginController)
);

router.get(
  '/me',
  jwtAuthMiddleware,
  loginController.getCurrentUser.bind(loginController)
);

router.post('/refresh', loginController.refreshToken.bind(loginController));

router.post(
  '/logout',
  jwtAuthMiddleware,
  loginController.logout.bind(loginController)
);

// ==================== SIGNUP ====================
router.post(
  '/request-otp',
  validateRequest(requestOtpSchema),
  signupController.requestOtp.bind(signupController)
);

router.post(
  '/verify-otp',
  validateRequest(verifyOtpSchema),
  signupController.verifyOtp.bind(signupController)
);

router.post(
  '/signup',
  validateRequest(signupSchema),
  signupController.signup.bind(signupController)
);

// ==================== PASSWORD RESET ====================
router.post(
  '/forgot-password/request-otp',
  validateRequest(requestOtpSchema),
  passwordResetController.requestOtp.bind(passwordResetController)
);

router.post(
  '/forgot-password/verify-otp',
  validateRequest(verifyOtpSchema),
  passwordResetController.verifyOtp.bind(passwordResetController)
);

router.post(
  '/forgot-password/reset',
  validateRequest(resetPasswordSchema),
  passwordResetController.resetPassword.bind(passwordResetController)
);

export default router;