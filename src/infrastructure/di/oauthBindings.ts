// ─────────────────────────────────────────────────────────────────────────────
// DI CONTAINER — OAuth bindings
// Add this block to your existing src/infrastructure/di/container.ts
// ─────────────────────────────────────────────────────────────────────────────

import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { env } from '../../shared/config/env';
import { OAuthProvider } from '../../domain/entities/OAuthConnection';
import { OAuthProviderPort } from '../../application/ports/OAuthProviderPort';

// Adapters
import { GoogleOAuthAdapter } from '../oauth/GoogleOAuthAdapter';
import { FacebookOAuthAdapter } from '../oauth/FacebookOAuthAdapter';

import { MicrosoftOAuthAdapter } from '../oauth/MicrosoftOAuthAdapter';

// Repository + State Store
import { MongoOAuthConnectionRepository } from '../database/repositories/MongoOAuthConnectionRepository';
import { RedisOAuthStateStore } from '../redis/RedisOAuthStateStore';

// Use Cases
import { InitiateOAuthUseCase } from '../../application/auth/oauth/InitiateOAuthUseCase';
import { HandleOAuthCallbackUseCase } from '../../application/auth/oauth/HandleOAuthCallbackUseCase';

// Controller
import { OAuthController } from '../../presentation/controllers/OAuthController';

export function bindOAuthDependencies(container: Container): void {
  const backendUrl = env.backendUrl; // add BACKEND_URL to your env.ts (see env additions)

  // ── Provider Adapters ────────────────────────────────────────────────────
  const googleAdapter = new GoogleOAuthAdapter({
    clientId: env.googleClientId,
    clientSecret: env.googleClientSecret,
    redirectUri: `${backendUrl}/auth/oauth/google/callback`,
  });

  const facebookAdapter = new FacebookOAuthAdapter({
    clientId: env.facebookAppId,
    clientSecret: env.facebookAppSecret,
    redirectUri: `${backendUrl}/auth/oauth/facebook/callback`,
  });

  const microsoftAdapter = new MicrosoftOAuthAdapter({
    clientId: env.microsoftClientId,
    clientSecret: env.microsoftClientSecret,
    redirectUri: `${backendUrl}/auth/oauth/microsoft/callback`,
    tenant: env.microsoftTenant,
  });

  // ── Provider Registry (Map injected into use cases) ───────────────────────
  const providerRegistry = new Map<OAuthProvider, OAuthProviderPort>([
    ['google', googleAdapter],
    ['facebook', facebookAdapter],
    ['microsoft', microsoftAdapter],
  ]);

  container
    .bind<Map<OAuthProvider, OAuthProviderPort>>(TYPES.OAuthProviderRegistry)
    .toConstantValue(providerRegistry);

  // ── Repository + State Store ───────────────────────────────────────────────
  container
    .bind<MongoOAuthConnectionRepository>(TYPES.OAuthConnectionRepositoryPort)
    .to(MongoOAuthConnectionRepository)
    .inSingletonScope();

  container
    .bind<RedisOAuthStateStore>(TYPES.OAuthStateStorePort)
    .to(RedisOAuthStateStore)
    .inSingletonScope();

  // ── Use Cases ──────────────────────────────────────────────────────────────
  container
    .bind<InitiateOAuthUseCase>(TYPES.InitiateOAuthUseCase)
    .to(InitiateOAuthUseCase)
    .inSingletonScope();

  container
    .bind<HandleOAuthCallbackUseCase>(TYPES.HandleOAuthCallbackUseCase)
    .to(HandleOAuthCallbackUseCase)
    .inSingletonScope();

  // ── Controller ─────────────────────────────────────────────────────────────
  container
    .bind<OAuthController>(TYPES.OAuthController)
    .to(OAuthController)
    .inSingletonScope();
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE in your existing container.ts:
//
//   import { bindOAuthDependencies } from './oauthBindings';
//   bindOAuthDependencies(container);
// ─────────────────────────────────────────────────────────────────────────────