import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from '../../presentation/routes/auth.routes'
import oauthRoutes from '../../presentation/routes/oauth.routes'

import instructorRoutes  from '../../presentation/routes/instructor.routes';
import apiRoutes from '../../presentation/routes';
import profileRoutes from "../../presentation/routes/profile.routes"

import { globalErrorHandler } from '../../presentation/middlewares/error.middleware';
import { env } from '../../shared/config/env';

export function createExpressApp() {
  const app = express();

  app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  })
);


  

  app.use(express.json());
  app.use(cookieParser());

  app.use('/api', apiRoutes);
  app.use('/auth', authRoutes)
  app.use(
  '/instructor',
  instructorRoutes
);
app.use('/profile', profileRoutes)
app.use('/auth/oauth', oauthRoutes)


  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      message: 'Route not found',
      path: req.originalUrl,
    });
  });

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
}
