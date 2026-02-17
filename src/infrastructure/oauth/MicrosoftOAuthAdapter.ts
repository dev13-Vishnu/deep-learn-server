import { injectable } from 'inversify';
import { BaseOAuthAdapter, BaseAdapterConfig } from './BaseOAuthAdapter';
import { OAuthUserProfile } from '../../application/ports/OAuthProviderPort';

interface MicrosoftRawProfile {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName?: string; // fallback when mail is null (work/school accounts)
}

@injectable()
export class MicrosoftOAuthAdapter extends BaseOAuthAdapter {
  readonly providerName = 'microsoft' as const;
  private readonly tenant: string;

  // endpoints is a getter because tenant is set in constructor
  protected get endpoints() {
    return {
      authorizationUrl: `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`,
      profileUrl: 'https://graph.microsoft.com/v1.0/me',
    };
  }

  constructor(config: Omit<BaseAdapterConfig, 'scopes'> & { tenant?: string }) {
    super({ ...config, scopes: ['openid', 'email', 'profile', 'User.Read'] });
    this.tenant = config.tenant ?? 'common'; // 'common' = personal + work accounts
  }

  protected additionalAuthParams(): Record<string, string> {
    return { response_mode: 'query' };
  }

  protected normalizeProfile(raw: Record<string, unknown>): OAuthUserProfile {
    const profile = raw as unknown as  MicrosoftRawProfile;
    // Microsoft uses `mail` for personal accounts, `userPrincipalName` for org accounts
    const email = profile.mail ?? profile.userPrincipalName ?? '';

    return {
      providerId: profile.id,
      email,
      name: profile.displayName,
      avatarUrl: undefined, // Requires a separate Graph API call — excluded for simplicity
    };
  }
}