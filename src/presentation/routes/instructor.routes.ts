import { Router } from "express";
import { container } from "../../infrastructure/di/container";
import { InstructorController } from "../controllers/InstructorController";
import { TYPES } from "../../shared/di/types";
import { jwtAuthMiddleware } from "../../infrastructure/security/jwt-auth.middleware";

const router = Router();

//Resolve controller from DI container
const instructorController = container.get<InstructorController>(
    TYPES.InstructorController
);

/* ================= INSTRUCTOR ================= */

router.post(
  '/apply',
  jwtAuthMiddleware,
  instructorController.apply.bind(instructorController)
);

router.get(
  '/status',
  jwtAuthMiddleware,
  instructorController.getStatus.bind(instructorController)
);

export default router;
