import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// Register feature routes here
router.use('/health', healthRoutes);

export default router;
