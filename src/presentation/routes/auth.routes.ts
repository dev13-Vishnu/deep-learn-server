import { Router, Request, Response } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { AuthHttpAdapter } from '../http/AuthHttpAdapter';
import { SignupHttpAdapter } from '../http/SignupHttpAdapter';
import { toHttpRequest, toHttpResponse } from '../../infrastructure/http/ExpressBridge';
import { validateRequest } from '../middlewares/validationRequest';
import {
  loginSchema, requestOtpSchema, resetPasswordSchema, signupSchema, verifyOtpSchema,
} from '../validators/auth.validators';
import { jwtAuthMiddleware } from '../../infrastructure/security/middlewares';

const router = Router();

const authAdapter   = container.get<AuthHttpAdapter>(TYPES.AuthHttpAdapter);
const signupAdapter = container.get<SignupHttpAdapter>(TYPES.SignupHttpAdapter);

const bind = (fn: (req: any, res: any) => Promise<void>) =>
  (req: Request, res: Response) => fn(toHttpRequest(req), toHttpResponse(res));

router.post('/login',   validateRequest(loginSchema),   bind(authAdapter.login.bind(authAdapter)));
router.get( '/me',      jwtAuthMiddleware,               bind(authAdapter.getCurrentUser.bind(authAdapter)));
router.post('/refresh',                                  bind(authAdapter.refreshToken.bind(authAdapter)));
router.post('/logout',  jwtAuthMiddleware,               bind(authAdapter.logout.bind(authAdapter)));

router.post('/request-otp', validateRequest(requestOtpSchema), bind(signupAdapter.requestOtp.bind(signupAdapter)));
router.post('/verify-otp',  validateRequest(verifyOtpSchema),  bind(signupAdapter.verifyOtp.bind(signupAdapter)));
router.post('/signup',      validateRequest(signupSchema),      bind(signupAdapter.signup.bind(signupAdapter)));

router.post('/forgot-password/request-otp', validateRequest(requestOtpSchema), bind(authAdapter.requestPasswordResetOtp.bind(authAdapter)));
router.post('/forgot-password/verify-otp',  validateRequest(verifyOtpSchema),  bind(authAdapter.verifyPasswordResetOtp.bind(authAdapter)));
router.post('/forgot-password/reset',       validateRequest(resetPasswordSchema), bind(authAdapter.resetPassword.bind(authAdapter)));

export default router;