import express from 'express';
import apiRoutes from '../../presentation/routes';
import { globalErrorHandler } from '../../presentation/middlewares/error.middleware';
import authRoutes from '../../presentation/routes/auth.routes'
import cors from 'cors';

export function createExpressApp() {
  const app = express();

  app.use(cors({
    origin: 'http://localhost:5173',
    credentials
    :true,
  }));
  

  app.use(express.json());

  app.use('/api', apiRoutes);
  app.use('/auth', authRoutes)

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
