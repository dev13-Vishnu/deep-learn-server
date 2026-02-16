import axios from 'axios';
import { OAuthProviderPort, OAuthUserProfile } from '../../application/ports/OAuthProviderPort';
import { OAuthProvider } from '../../domain/entities/OAuthConnection';
import { AppError } from '../../shared/errors/AppError';

export interface ProviderEndpoints {
  authorizationUrl: string;
  tokenUrl: string;
  profileUrl: string;
}

export interface BaseAdapterConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export abstract class BaseOAuthAdapter implements OAuthProviderPort {
  abstract readonly providerName: OAuthProvider;
  protected abstract readonly endpoints: ProviderEndpoints;

  constructor(protected readonly config: BaseAdapterConfig) {}


  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      state,
      ...this.additionalAuthParams(),
    });

    return `${this.endpoints.authorizationUrl}?${params.toString()}`;
  }


  async exchangeCodeForProfile(code: string): Promise<OAuthUserProfile> {
    const accessToken = await this.fetchAccessToken(code);
    const rawProfile = await this.fetchRawProfile(accessToken);
    return this.normalizeProfile(rawProfile);
  }


  private async fetchAccessToken(code: string): Promise<string> {
    try {
      const response = await axios.post<{ access_token: string }>(
        this.endpoints.tokenUrl,
        new URLSearchParams({
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code',
          ...this.additionalTokenParams(),
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      return response.data.access_token;
    } catch (error) {
      throw new AppError(
        `Failed to exchange authorization code with ${this.providerName}`,
        502
      );
    }
  }


  private async fetchRawProfile(accessToken: string): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get<Record<string, unknown>>(
        this.buildProfileUrl(accessToken),
        { headers: this.buildProfileHeaders(accessToken) }
      );

      return response.data;
    } catch (error) {
      throw new AppError(
        `Failed to fetch user profile from ${this.providerName}`,
        502
      );
    }
  }


  protected additionalAuthParams(): Record<string, string> {
    return {};
  }

  protected additionalTokenParams(): Record<string, string> {
    return {};
  }

  protected buildProfileUrl(_accessToken: string): string {
    return this.endpoints.profileUrl;
  }

  protected buildProfileHeaders(accessToken: string): Record<string, string> {
    return { Authorization: `Bearer ${accessToken}` };
  }

  protected abstract normalizeProfile(raw: Record<string, unknown>): OAuthUserProfile;
}