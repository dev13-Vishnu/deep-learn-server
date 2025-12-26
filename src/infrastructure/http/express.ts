import express from 'express';
import healthRoutes from '../../presentation/routes/health.routes';

export function createExpressApp() {
  const app = express();

  app.use(express.json());

  app.use('/health', healthRoutes);

  return app;
}
