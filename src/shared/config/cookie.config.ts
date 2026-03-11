import { env } from './env';
import { authConfig } from './auth.config';
import { CookieOptions } from '../http/HttpContext';

const isCrossSite = env.isProduction || env.isTunnel;

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure:   isCrossSite,
  sameSite: isCrossSite ? 'none' : 'lax',
  maxAge:   authConfig.refreshToken.expiresInMs,
};

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken' as const;
