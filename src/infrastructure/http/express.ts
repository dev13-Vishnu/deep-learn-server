import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from '../../presentation/routes/auth.routes'
import instructorRoutes  from '../../presentation/routes/instructor.routes';
import apiRoutes from '../../presentation/routes';
import profileRoutes from "../../presentation/routes/profile.routes"

import { globalErrorHandler } from '../../presentation/middlewares/error.middleware';
import { env } from '../../shared/config/env';

export function createExpressApp() {
  const app = express();

  const allowedOrigins = [
  env.frontendOrigin,
  "http://localhost:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
