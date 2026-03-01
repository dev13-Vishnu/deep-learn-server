import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { CourseController } from '../controllers/CourseController';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { tutorAuthMiddleware } from '../../infrastructure/security/tutor-auth.middleware';
import { validateRequest } from '../middlewares/validationRequest';
import { createCourseSchema } from '../validators/course.validators';

const router = Router();

const courseController = container.get<CourseController>(TYPES.CourseController);


router.post(
  '/',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(createCourseSchema),
  courseController.createCourse.bind(courseController)
);

export default router;