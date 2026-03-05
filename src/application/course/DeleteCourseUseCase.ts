import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import {
  DeleteCourseRequestDTO,
  DeleteCourseResponseDTO,
} from '../dto/course/DeleteCourse.dto';

@injectable()
export class DeleteCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: DeleteCourseRequestDTO): Promise<DeleteCourseResponseDTO> {
    // 1. Load course
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // 2. Ownership check
    if (course.tutorId !== dto.tutorId) {
      throw new AppError('You do not have permission to delete this course', 403);
    }

    // 3. Enrollment guard — cannot delete a course students have paid for
    if (course.enrollmentCount > 0) {
      throw new AppError(
        'Cannot delete a course with enrolled students. Archive it instead.',
        409
      );
    }

    // 4. Hard delete
    await this.courseRepository.delete(dto.courseId);

    return { message: 'Course deleted successfully' };
  }
}