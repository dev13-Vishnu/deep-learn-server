// ─────────────────────────────────────────────────────────────────────────────
// INFRASTRUCTURE: FacebookOAuthAdapter
// Facebook-specific: fields query param on profile URL, token in URL not header.
// ─────────────────────────────────────────────────────────────────────────────

import { injectable } from 'inversify';
import { BaseOAuthAdapter, BaseAdapterConfig } from './BaseOAuthAdapter';
import { OAuthUserProfile } from '../../application/ports/OAuthProviderPort';

interface FacebookRawProfile {
  id: string;
  email: string;
  name: string;
  picture?: { data?: { url?: string } };
}

@injectable()
export class FacebookOAuthAdapter extends BaseOAuthAdapter {
  readonly providerName = 'facebook' as const;

  protected readonly endpoints = {
    authorizationUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    profileUrl: 'https://graph.facebook.com/me',
  };

  constructor(config: Omit<BaseAdapterConfig, 'scopes'>) {
    super({ ...config, scopes: ['email', 'public_profile'] });
  }

  // Facebook requires fields + access_token as query params on the profile URL
  protected buildProfileUrl(accessToken: string): string {
    const params = new URLSearchParams({
      fields: 'id,name,email,picture',
      access_token: accessToken,
    });
    return `${this.endpoints.profileUrl}?${params.toString()}`;
  }

  // Token is in URL, no Authorization header needed
  protected buildProfileHeaders(_accessToken: string): Record<string, string> {
    return {};
  }

  protected normalizeProfile(raw: Record<string, unknown>): OAuthUserProfile {
    const profile = raw as FacebookRawProfile;
    return {
      providerId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture?.data?.url,
    };
  }
}