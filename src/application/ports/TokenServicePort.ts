import { UserRole } from '../../domain/entities/UserRole';

export interface TokenPayload {
  userId: string;
  role:   UserRole;
}

export interface TokenServicePort {
    generateAccessToken(payload: TokenPayload): string;
    verifyAccessToken(toke: string): TokenPayload;
    generateRefreshToken(): string;
    hashToken(token: string): string;
}