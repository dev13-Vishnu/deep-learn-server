import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import {
  DeleteCourseRequestDTO,
  DeleteCourseResponseDTO,
} from '../dto/course/DeleteCourse.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

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
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    // 2. Ownership check
    if (course.tutorId !== dto.tutorId) {
      throw new ApplicationError('FORBIDDEN', 'You do not have permission to delete this course');
    }

    // 3. Enrollment guard — cannot delete a course students have paid for
    if (course.enrollmentCount > 0) {
      throw new ApplicationError('COURSE_HAS_ENROLLMENTS', 'Cannot delete/remove a course with enrolled students. Archive it instead.');
    }

    // 4. Hard delete
    await this.courseRepository.delete(dto.courseId);

    return { message: 'Course deleted successfully' };
  }
}