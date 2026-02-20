import { Router } from "express";
import { container } from "../../infrastructure/di/container";
import { InstructorController } from "../controllers/InstructorController";
import { TYPES } from "../../shared/di/types";
import { jwtAuthMiddleware } from "../../infrastructure/security/jwt-auth.middleware";
import { adminAuthMiddleware } from '../../infrastructure/security/admin-auth.middleware';
import { validateRequest } from '../middlewares/validationRequest';
import { applyForInstructorSchema, rejectApplicationSchema } from '../validators/instructor.validators';


const router = Router();

//Resolve controller from DI container
const instructorController = container.get<InstructorController>(
    TYPES.InstructorController
);

/* ================= INSTRUCTOR ================= */

router.post(
  '/apply',
  jwtAuthMiddleware,
  validateRequest(applyForInstructorSchema),
  instructorController.apply.bind(instructorController)
);

router.get(
  '/status',
  jwtAuthMiddleware,
  instructorController.getStatus.bind(instructorController)
);


// Admin routes (admin only)
router.get(
  '/applications',
  jwtAuthMiddleware,
  adminAuthMiddleware,
  instructorController.listApplications.bind(instructorController)
);

router.post(
  '/applications/:applicationId/approve',
  jwtAuthMiddleware,
  adminAuthMiddleware,
  instructorController.approveApplication.bind(instructorController)
);

router.post(
  '/applications/:applicationId/reject',
  jwtAuthMiddleware,
  adminAuthMiddleware,
  validateRequest(rejectApplicationSchema),
  instructorController.rejectApplication.bind(instructorController)
);
export default router;
