import { injectable } from "inversify";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { TokenPayload, TokenServicePort } from "../../application/ports/TokenServicePort";
import { env } from "../../shared/config/env";
import { ApplicationError } from "../../shared/errors/ApplicationError";

@injectable()
export class JwtTokenService implements TokenServicePort {
  generateAccessToken (payload: TokenPayload): string{
    const secret = env.jwtSecret

    if(!secret) {
      throw new ApplicationError('CONFIGURATION_ERROR', 'JWT access secret not configured');
    }

    return jwt.sign(payload,secret,{
      expiresIn:env.jwtExpiresIn
    });
  }

  verifyAccessToken(token: string): TokenPayload {
      const secret = env.jwtSecret;

      if(!secret) {
        throw new ApplicationError('CONFIGURATION_ERROR', 'JWT access secret not configured');
      }

      try {
        return jwt.verify(token, secret) as TokenPayload;
      } catch  {
        throw new ApplicationError('TOKEN_INVALID', 'Invalid or expired access token');
      }
  }

  generateRefreshToken(): string {
      return crypto.randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
      return crypto.createHash('sha256').update(token).digest('hex');
  }
}