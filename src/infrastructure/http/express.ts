import express, { Router, ErrorRequestHandler } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '../../shared/config/env';

export interface AppRouters {
  authRouter:       Router;
  oauthRouter:      Router;
  profileRouter:    Router;
  instructorRouter: Router; 
  apiRouter:        Router; 
}

export function createExpressApp(
  routers: AppRouters,
  errorHandler: ErrorRequestHandler,
) {
  const app = express();

  app.use(cors({ origin: env.frontendOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api',        routers.apiRouter);
  app.use('/auth',       routers.authRouter);
  app.use('/auth/oauth', routers.oauthRouter);
  app.use('/profile',    routers.profileRouter);
  app.use('/instructor', routers.instructorRouter);

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found', path: req.originalUrl });
  });

  app.use(errorHandler);

  return app;
}