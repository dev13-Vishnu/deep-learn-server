import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './jwt-auth.middleware';
import { AppError } from '../../shared/errors/AppError';
import { UserRole } from '../../domain/entities/UserRole';

export function tutorAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    throw new AppError('Authentication required', 401);
  }

  // Admins can also access tutor routes
  if (authReq.user.role !== UserRole.TUTOR && authReq.user.role !== UserRole.ADMIN) {
    throw new AppError('Tutor access required', 403);
  }

  next();
}