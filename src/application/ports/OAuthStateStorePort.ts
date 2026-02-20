export interface OAuthStateStorePort {
    save(state: string, ttlSeconds?: number):Promise<void>

    consume(state: string): Promise<boolean>;
}