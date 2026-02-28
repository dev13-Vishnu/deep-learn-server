export interface RefreshTokenRequestDTO {
  plainToken: string;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}