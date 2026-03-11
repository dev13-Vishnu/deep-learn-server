import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { UserRole } from '../../domain/entities/UserRole';
import { AuthenticatedRequest } from './AuthenticatedRequest';

export function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    throw new AppError('Authentication required', 401);
  }

  if (authReq.user.role !== UserRole.ADMIN) {
    throw new AppError('Admin access required', 403);
  }

  next();
}