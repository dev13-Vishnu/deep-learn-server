export interface CreateRefreshTokenPort {
  execute(userId: string): Promise<{ token: string; expiresAt: Date }>;
}
