

export type OAuthProvider = 'google' | 'facebook' | 'microsoft';

export class OAuthConnection {
  constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly provider: OAuthProvider,
    public readonly providerId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly avatarUrl: string | undefined,
    public readonly linkedAt: Date
  ) {}
}