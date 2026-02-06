import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from '../../presentation/routes/auth.routes'
import instructorRoutes  from '../../presentation/routes/instructor.routes';
import apiRoutes from '../../presentation/routes';
import userRoutes from "../../presentation/routes"

import { globalErrorHandler } from '../../presentation/middlewares/error.middleware';

export function createExpressApp() {
  const app = express();

  app.use(cors({
    origin: 'http://localhost:5173',
    credentials
    :true,
  }));
  

  app.use(express.json());
  app.use(cookieParser());

  app.use('/api', apiRoutes);
  app.use('/auth', authRoutes)
  app.use('/users',userRoutes)
  app.use(
  '/instructor',
  instructorRoutes
);


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
