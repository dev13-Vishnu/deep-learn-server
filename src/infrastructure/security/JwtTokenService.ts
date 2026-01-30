import { injectable } from "inversify";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { TokenPayload, TokenServicePort } from "../../application/ports/TokenServicePort";
import { env } from "../../shared/config/env";
import { AppError } from "../../shared/errors/AppError";

@injectable()
export class JwtTokenService implements TokenServicePort {
  generateAccessToken (payload: TokenPayload): string{
    const secret = env.jwtSecret

    if(!secret) {
      throw new AppError('JWT access secret not configured', 500);
    }

    return jwt.sign(payload,secret,{
      expiresIn:env.jwtExpiresIn
    });
  }

  verifyAccessToken(token: string): TokenPayload {
      const secret = env.jwtSecret;

      if(!secret) {
        throw new AppError('JWT access secret not configure', 500);
      }

      try {
        return jwt.verify(token, secret) as TokenPayload;
      } catch  {
        throw new AppError('Invalid or expired access token', 401);
      }
  }

  generateRefreshToken(): string {
      return crypto.randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
      return crypto.createHash('sha256').update(token).digest('hex');
  }
}