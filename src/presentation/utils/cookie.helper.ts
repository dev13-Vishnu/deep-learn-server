import { env } from "../../shared/config/env";
import { Request, Response } from "express";

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite : 'strict' as const,
    path: '/',
};

export class CookieHelper {
    static setRefreshTokenCookie(
        res: Response,
        token: string,
        maxAgeMs: number
    ): void{
        res.cookie(REFRESH_TOKEN_COOKIE_NAME,token, {
            ...COOKIE_OPTIONS,
            maxAge: maxAgeMs,
        });
    }

    static clearRefreshTokenCookie(res: Response): void {
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME,{
            ...COOKIE_OPTIONS,
            maxAge: 0,
        });
    }
    static getRefreshToken (req: Request): string | null {
        const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
        return token ?? null;
    }

}