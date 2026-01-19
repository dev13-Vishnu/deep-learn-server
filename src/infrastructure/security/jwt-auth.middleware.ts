import { NextFunction, Request, Response } from "express";
import { JwtService } from "./jwt.services";
import { UserRole } from "../../domain/entities/UserRole";

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
        const payload = JwtService.verify(token);

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