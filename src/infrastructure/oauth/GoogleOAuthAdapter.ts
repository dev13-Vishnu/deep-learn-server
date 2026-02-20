import { injectable } from 'inversify';
import { BaseOAuthAdapter, BaseAdapterConfig } from './BaseOAuthAdapter';
import { OAuthUserProfile } from '../../application/ports/OAuthProviderPort';

interface GoogleRawProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

@injectable()
export class GoogleOAuthAdapter extends BaseOAuthAdapter {
  readonly providerName = 'google' as const;

  protected readonly endpoints = {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
  };

  constructor(config: Omit<BaseAdapterConfig, 'scopes'>) {
    super({ ...config, scopes: ['openid', 'email', 'profile'] });
  }

  protected additionalAuthParams(): Record<string, string> {
    return {
      access_type: 'offline', 
      prompt: 'consent',
    };
  }

  protected normalizeProfile(raw: Record<string, unknown>): OAuthUserProfile {
    const profile = raw as unknown as GoogleRawProfile;
    return {
      providerId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    };
  }
}