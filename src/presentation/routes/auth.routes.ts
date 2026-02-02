import { Router } from "express";

import { jwtAuthMiddleware } from "../../infrastructure/security/jwt-auth.middleware";
import { container } from "../../infrastructure/di/container";
import { TYPES } from "../../shared/di/types";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

const authController = container.get<AuthController>(
  TYPES.AuthController
);

router.post('/login', authController.login.bind(authController));

router.post(
  "/request-otp",
  authController.requestSignupOtp.bind(authController)
);

router.post(
  "/signup",
  authController.signup.bind(authController)
);

router.post(
  "/forgot-password/request-otp",
  authController.requestPasswordResetOtp.bind(authController)
);

router.post(
  "/forgot-password/verify-otp",
  authController.verifyPasswordResetOtp.bind(authController)
);

router.post(
  "/forgot-password/reset",
  authController.resetPassword.bind(authController)
);

router.get(
  '/me',
  jwtAuthMiddleware,
  authController.me.bind(authController)
);

router.post(
  '/refresh',
  authController.refresh.bind(authController)
);

router.post(
  '/logout',
  authController.logout.bind(authController)
);

export default router;
