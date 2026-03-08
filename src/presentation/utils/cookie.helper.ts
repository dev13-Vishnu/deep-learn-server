import { HttpRequest, HttpResponse } from '../../shared/http/HttpContext';
import { refreshTokenCookieOptions } from '../../shared/config/cookie.config';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export class CookieHelper {
  static setRefreshTokenCookie(
    res:      HttpResponse,
    token:    string,
    maxAgeMs: number,
  ): void {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
      ...refreshTokenCookieOptions,
      maxAge: maxAgeMs,
    });
  }

  static clearRefreshTokenCookie(res: HttpResponse): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
  }

  static getRefreshToken(req: HttpRequest): string | null {
    return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] ?? null;
  }
}