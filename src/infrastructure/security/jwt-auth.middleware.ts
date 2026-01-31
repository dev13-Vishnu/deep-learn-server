/* ================= TYPES ================= */

import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";

import { TYPES } from "../../shared/di/types";
import { TokenServicePort } from "../../application/ports/TokenServicePort";
import { container } from "../di/container";

export interface AuthenticatedRequest extends Request {
    user?:{
        userId: string;
        role: number;
    };
}

/* ================= MIDDLEWARE ================= */

@injectable()
export class JwtAuthMiddleware {
    constructor(
        @inject(TYPES.TokenServicePort)
        private readonly tokenService: TokenServicePort
    ) {}

    handle = (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        try {
            const authHeader  = req.headers.authorization;

            if(!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({message: 'Unauthorized'});
                return;
            }

            const token = authHeader.split(' ')[1];

            const payload = this.tokenService.verifyAccessToken(token);

            (req as AuthenticatedRequest).user = {
                userId: payload.userId,
                role: payload.role,
            }

            next();
        } catch {
            res.status(401).json({ message: 'Invalid or expired token'});
        }
    }
}

export const jwtAuthMiddleware =
  container.get<JwtAuthMiddleware>(
    TYPES.JwtAuthMiddleware
  ).handle;


// import { NextFunction, Request, Response } from "express";
// import { JwtService } from "./jwt.services";
// import { UserRole } from "../../domain/entities/UserRole";

// export interface AuthenticatedRequest extends Request {
//     user?: {
//         userId: string;
//         role:UserRole;
//     };
// }

// export function jwtAuthMiddleware (
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
// ) {
//     const authHeader = req.headers.authorization;

//     if(!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({
//             message: 'Authorization token missing or invalid',
//         });
//     }

//     const token = authHeader.split(' ')[1];

//     try{
//         const payload = JwtService.verify(token);

//         req.user = {
//             userId: payload.userId,
//             role: payload.role,
//         };

//         next();
//     } catch (error) {
//         return res.status(401).json({
//             message: 'Invalid or expired token',
//         });
//     }
// }

