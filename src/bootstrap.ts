import 'reflect-metadata';
import { logger } from './shared/utils/logger';

// ── 1. Initialize the DI container (side-effectful imports) ───────────────────
import { container } from './infrastructure/di/container';
import { PRESENTATION_TYPES } from './presentation/di/presentationTypes';

// ── 2. Resolve adapters ────────────────────────────────────────────────────────
import { AuthHttpAdapter }       from './presentation/http/AuthHttpAdapter';
import { SignupHttpAdapter }      from './presentation/http/SignupHttpAdapter';
import { OAuthHttpAdapter }       from './presentation/http/OAuthHttpAdapter';
import { ProfileHttpAdapter }     from './presentation/http/ProfileHttpAdapter';
import { InstructorHttpAdapter }  from './presentation/http/InstructorHttpAdapter';
import { CourseHttpAdapter }      from './presentation/http/CourseHttpAdapter';

// ── 3. Route factories ─────────────────────────────────────────────────────────
import { createAuthRouter }       from './presentation/routes/auth.routes';
import { createOAuthRouter }      from './presentation/routes/oauth.routes';
import { createProfileRouter }    from './presentation/routes/profile.routes';
import { createInstructorRouter } from './presentation/routes/instructor.routes';
import { createCourseRouter }     from './presentation/routes/course.routes';
import apiRouter                  from './presentation/routes/index';

// ── 4. App + server ────────────────────────────────────────────────────────────
import { createExpressApp } from './infrastructure/http/express';
import { startServer }      from './server';

process.on('uncaughtException', (error) => {
  logger.error('Uncaught fatal error during startup', error);
  process.exit(1);
});

// Resolve adapters — container is touched only here
const authAdapter       = container.get<AuthHttpAdapter>(PRESENTATION_TYPES.AuthHttpAdapter);
const signupAdapter     = container.get<SignupHttpAdapter>(PRESENTATION_TYPES.SignupHttpAdapter);
const oauthAdapter      = container.get<OAuthHttpAdapter>(PRESENTATION_TYPES.OAuthHttpAdapter);
const profileAdapter    = container.get<ProfileHttpAdapter>(PRESENTATION_TYPES.ProfileHttpAdapter);
const instructorAdapter = container.get<InstructorHttpAdapter>(PRESENTATION_TYPES.InstructorHttpAdapter);
const courseAdapter     = container.get<CourseHttpAdapter>(PRESENTATION_TYPES.CourseHttpAdapter);

// Build routers — no container access inside route files
const app = createExpressApp({
  authRouter:       createAuthRouter(authAdapter, signupAdapter),
  oauthRouter:      createOAuthRouter(oauthAdapter),
  profileRouter:    createProfileRouter(profileAdapter),
  instructorRouter: createInstructorRouter(instructorAdapter),
  courseRouter:     createCourseRouter(courseAdapter),
  apiRouter,
});

startServer(app);