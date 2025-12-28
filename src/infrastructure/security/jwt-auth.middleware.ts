import { NextFunction, Request, Response } from "express";
import { JwtService } from "./jwt.services";

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: 'student' | 'tutor' | 'admin';
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
            message: 'Authorization toke missing or invalid',
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