import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { logger } from '../../shared/utils/logger';

const ERROR_STATUS_MAP: Record<string, number> = {
  // Auth
  INVALID_CREDENTIALS: 401,
  SOCIAL_LOGIN_REQUIRED: 400,
  TOKEN_INVALID: 401,
  TOKEN_EXPIRED: 401,
  USER_ALREADY_EXISTS: 409,
  // OTP
  OTP_EXPIRED: 400,
  OTP_INVALID: 400,
  OTP_TOO_MANY_ATTEMPTS: 429,
  // OAuth
  OAUTH_STATE_INVALID: 400,
  OAUTH_PROVIDER_NOT_CONFIGURED: 400,
  OAUTH_TOKEN_EXCHANGE_FAILED:   502,
  OAUTH_PROFILE_FETCH_FAILED:    502,
  // User / profile
  USER_NOT_FOUND: 404,
  ACCOUNT_INACTIVE: 403,
  NO_AVATAR: 400,
  // Instructor
  APPLICATION_NOT_FOUND: 404,
  APPLICATION_COOLDOWN_ACTIVE: 403,
  APPLICATION_ALREADY_PENDING: 400,
  APPLICATION_ALREADY_APPROVED: 400,
  // Course
  COURSE_NOT_FOUND: 404,
  COURSE_HAS_ENROLLMENTS: 409,
  FORBIDDEN: 403,
  // Domain / input
  DOMAIN_RULE_VIOLATED: 422,
  VALIDATION_ERROR: 400,
  // Infrastructure
  EMAIL_SEND_FAILED: 500,
  CONFIGURATION_ERROR: 500,
  // Catch-all
  INTERNAL_ERROR: 500,
};

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ApplicationError) {
    const status = ERROR_STATUS_MAP[err.errorType] ?? 500;
    return res.status(status).json({ message: err.message });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  logger.error('Unhandled error', err);
  return res.status(500).json({ message: 'Internal server error' });
}