export interface IRefreshAccessTokenUseCase {
  execute(plainToken: string): Promise<{
    accessToken:           string;
    refreshToken:          string;
    refreshTokenExpiresAt: Date;
  }>;
}