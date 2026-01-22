import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../../shared/config/env';
import { UserRole } from '../../domain/entities/UserRole';
import crypto from 'crypto';

export interface AuthTokenPayload {
  userId: string;
  role:UserRole;
}

export class JwtService {
  static sign(payload: AuthTokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.jwtExpiresIn,
    };

    return jwt.sign(
      payload,
      env.jwtSecret,
      options,
    );
  }

  static verify(token: string): AuthTokenPayload {
    const decoded = jwt.verify(
      token,
      env.jwtSecret,
    ) as JwtPayload;

    return {
      userId: decoded.userId as string,
      role: decoded.role as UserRole
    };
  }

  static generateRefreshToken(): string{
    return crypto.randomBytes(64).toString('hex');
  }

  static hashToken(token: string) : string{
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }
}
