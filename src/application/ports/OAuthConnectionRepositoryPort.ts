import { OAuthConnection, OAuthProvider } from "../../domain/entities/OAuthConnnection";

export interface OAuthConnectionRepositoryPort {
    findByProvider(provider: OAuthProvider, providerId: string): Promise<OAuthConnection | null>;
    findByUserId(userId: string): Promise<OAuthConnection[]>;
    create(connection: OAuthConnection): Promise<OAuthConnection>;
}