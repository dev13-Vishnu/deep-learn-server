import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../domain/entities/UserRole";
import { container } from "../di/container";
import { TYPES } from "../../shared/di/types";
import { TokenServicePort } from "../../application/ports/TokenServicePort";


export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role:UserRole;
    };
}

export function jwtAuthMiddleware (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization token missing or invalid',
        });
    }

    const token = authHeader.split(' ')[1];

    try{
        const tokenService =
  container.get<TokenServicePort>(TYPES.TokenServicePort);

const payload = tokenService.verifyAccessToken(token);


        req.user = {
            userId: payload.userId,
            role: payload.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token',
        });
    }
}