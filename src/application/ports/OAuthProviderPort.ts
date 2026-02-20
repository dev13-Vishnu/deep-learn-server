import { OAuthProvider } from "../../domain/entities/OAuthConnection";

export interface OAuthUserProfile {
    providerId: string;
    email: string;
    name: string;
    avatarUrl ?: string;
}

export interface OAuthProviderPort {
    readonly providerName: OAuthProvider;

    getAuthorizationUrl(state: string): string;
    exchangeCodeForProfile(code: string): Promise<OAuthUserProfile>;
}