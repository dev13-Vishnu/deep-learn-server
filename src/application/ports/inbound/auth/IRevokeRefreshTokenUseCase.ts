export interface IRevokeRefreshTokenUseCase {
  execute(plainToken: string): Promise<void>;
}