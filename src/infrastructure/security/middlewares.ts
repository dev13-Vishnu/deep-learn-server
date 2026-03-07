import { container } from '../di/container';
import { TYPES } from '../../shared/di/types';
import { TokenServicePort } from '../../application/ports/TokenServicePort';
import { createJwtAuthMiddleware } from './jwt-auth.middleware';

export const jwtAuthMiddleware = createJwtAuthMiddleware(
    container.get<TokenServicePort>(TYPES.TokenServicePort)
);
