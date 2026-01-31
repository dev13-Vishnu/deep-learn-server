import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { jwtAuthMiddleware } from "../../infrastructure/security/jwt-auth.middleware";
import { rootCertificates } from "node:tls";
import { container } from "../../infrastructure/di/container";
import { TYPES } from "../../shared/di/types";

const authController  = container.get<AuthController>(
  TYPES.AuthController
);

const router = Router();
// router.post ('/register', AuthController.register);
router.post('/login', authController.login.bind(authController));

// router.get('/me', jwtAuthMiddleware,(req,res) => {
//     const user = (req as any). user;

//     return res.status(200).json({
//         message: 'Authenticated',
//         user,
//     });
// })
router.post("/request-otp", authController.requestSignupOtp.bind(authController))

router.post("/signup", authController.signup.bind(authController));
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
)
router.post(
  '/refresh',
  authController.refresh.bind(authController)
)

router.post(
  '/logout',
  authController.logout.bind(authController)
)


export default router;