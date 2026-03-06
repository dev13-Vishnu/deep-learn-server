import { UserRole } from '../../domain/entities/UserRole';
export { Request } from 'express';

export interface AuthenticatedRequest  extends Request {
    user?: {
        userId: string;
        role: UserRole;
    }
}