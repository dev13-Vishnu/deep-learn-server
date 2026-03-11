// server-only/src/bootstrap.ts

import 'reflect-metadata';
import { logger } from './shared/utils/logger';

//  1. DI container
import { container } from './infrastructure/di/container';
import { TYPES } from './shared/di/types';
import { PRESENTATION_TYPES } from './presentation/di/presentationTypes';

//  2. Port interfaces needed at composition root
import { TokenServicePort } from './application/ports/TokenServicePort';
import { LoggerPort } from './application/ports/LoggerPort';

//  3. JWT middleware factory
import { createJwtAuthMiddleware } from './infrastructure/security/jwt-auth.middleware';

//  4. HTTP adapters
import { AuthHttpAdapter }      from './presentation/http/AuthHttpAdapter';
import { SignupHttpAdapter }     from './presentation/http/SignupHttpAdapter';
import { OAuthHttpAdapter }      from './presentation/http/OAuthHttpAdapter';
import { ProfileHttpAdapter }    from './presentation/http/ProfileHttpAdapter';
import { InstructorHttpAdapter } from './presentation/http/InstructorHttpAdapter';
import { CourseHttpAdapter }     from './presentation/http/CourseHttpAdapter';

//  5. Route factories
import { createAuthRouter }             from './presentation/routes/auth.routes';
import { createOAuthRouter }            from './presentation/routes/oauth.routes';
import { createProfileRouter }          from './presentation/routes/profile.routes';
import { createInstructorRouter }       from './presentation/routes/instructor.routes';
import { createPublicCourseRouter }     from './presentation/routes/course.routes';
import { createInstructorCourseRouter } from './presentation/routes/instructor-course.routes';
import { createApiRouter }              from './presentation/routes/index';

import { globalErrorHandler } from './presentation/middlewares/error.middleware';

//  6. App factory + server
import { createExpressApp } from './infrastructure/http/express';
import { startServer }      from './server';

process.on('uncaughtException', (error) => {
  logger.error('Uncaught fatal error during startup', error);
  process.exit(1);
});

// Resolve adapters from DI container
const authAdapter       = container.get<AuthHttpAdapter>(PRESENTATION_TYPES.AuthHttpAdapter);
const signupAdapter     = container.get<SignupHttpAdapter>(PRESENTATION_TYPES.SignupHttpAdapter);
const oauthAdapter      = container.get<OAuthHttpAdapter>(PRESENTATION_TYPES.OAuthHttpAdapter);
const profileAdapter    = container.get<ProfileHttpAdapter>(PRESENTATION_TYPES.ProfileHttpAdapter);
const instructorAdapter = container.get<InstructorHttpAdapter>(PRESENTATION_TYPES.InstructorHttpAdapter);
const courseAdapter     = container.get<CourseHttpAdapter>(PRESENTATION_TYPES.CourseHttpAdapter);

// jwtAuthMiddleware resolved here — never inside route files
const tokenService      = container.get<TokenServicePort>(TYPES.TokenServicePort);
const jwtAuthMiddleware = createJwtAuthMiddleware(tokenService);

const appLogger = container.get<LoggerPort>(TYPES.LoggerPort);

const publicCourseRouter = createPublicCourseRouter(courseAdapter);

// Instructor course routes: POST /api/instructor/courses, etc. (JWT + tutor role)
const instructorCourseRouter = createInstructorCourseRouter(courseAdapter, jwtAuthMiddleware);

// /api router that composes health + both course routers
const apiRouter = createApiRouter(publicCourseRouter, instructorCourseRouter);

const app = createExpressApp(
  {
    authRouter:       createAuthRouter(authAdapter, signupAdapter, jwtAuthMiddleware),
    oauthRouter:      createOAuthRouter(oauthAdapter),
    profileRouter:    createProfileRouter(profileAdapter, jwtAuthMiddleware),
    instructorRouter: createInstructorRouter(instructorAdapter, jwtAuthMiddleware),
    apiRouter,
  },
  globalErrorHandler,
);

startServer(app, appLogger);