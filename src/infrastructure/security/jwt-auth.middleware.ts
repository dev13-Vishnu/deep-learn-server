import { NextFunction, Response } from "express";
import { TokenServicePort } from '../../application/ports/TokenServicePort';
export { AuthenticatedRequest } from '../../presentation/http/AuthenticatedRequest';
import { AuthenticatedRequest } from '../../presentation/http/AuthenticatedRequest';

export function createJwtAuthMiddleware(tokenService: TokenServicePort) {
    return function jwtAuthMiddleware(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): void {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                message: 'Authorization token missing or invalid',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            const payload = tokenService.verifyAccessToken(token);

            req.user = {
                userId: payload.userId,
                role: payload.role,
            };

            next();
        } catch (error) {
            res.status(401).json({
                message: 'Invalid or expired token',
            });
        }
    };
}