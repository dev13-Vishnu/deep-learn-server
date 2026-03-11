import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  GetTutorCourseRequestDTO,
  GetTutorCourseResponseDTO,
} from '../dto/course/GetTutorCourse.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { IGetTutorCourseUseCase } from '../ports/inbound/course/IGetTutorCourseUseCase';

@injectable()
export class GetTutorCourseUseCase implements IGetTutorCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: GetTutorCourseRequestDTO): Promise<GetTutorCourseResponseDTO> {

    const course = await this.courseRepository.findByIdAndTutor(
      dto.courseId,
      dto.tutorId
    );

    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    return {
      course: CourseMapper.toTutorDetail(course),
    };
  }
}