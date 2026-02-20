import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './jwt-auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    throw new AppError('Authentication required', 401);
  }

  // Check if user has admin role (assuming 2 = admin)
  if (authReq.user.role !== 2) {
    throw new AppError('Admin access required', 403);
  }

  next();
}