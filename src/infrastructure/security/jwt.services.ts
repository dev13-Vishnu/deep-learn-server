import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../../shared/config/env';

export interface AuthTokenPayload {
  userId: string;
  role: 'student' | 'tutor' | 'admin';
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
      role: decoded.role as 'student' | 'tutor' | 'admin',
    };
  }
}
