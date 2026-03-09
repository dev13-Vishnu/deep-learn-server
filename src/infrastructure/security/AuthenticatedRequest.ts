import { Request  } from 'express';
import { UserRole } from '../../domain/entities/UserRole';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role:   UserRole;
  };
}