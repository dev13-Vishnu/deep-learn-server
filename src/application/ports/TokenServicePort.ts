export interface TokenPayload {
    userId: string; 
    role: number;
}

export interface TokenServicePort {
    generateAccessToken(payload: TokenPayload): string;
    verifyAccessToken(toke: string): TokenPayload;
    generateRefreshToken(): string;
    hashToken(token: string): string;
}