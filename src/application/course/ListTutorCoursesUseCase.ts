import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  ListTutorCoursesRequestDTO,
  ListTutorCoursesResponseDTO,
} from '../dto/course/ListTutorCourses.dto';

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT     = 50;

@injectable()
export class ListTutorCoursesUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ListTutorCoursesRequestDTO): Promise<ListTutorCoursesResponseDTO> {
    const page  = Math.max(1, dto.page  ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, dto.limit ?? DEFAULT_LIMIT));
    const skip  = (page - 1) * limit;

    const filter = { status: dto.status };

    const [courses, total] = await Promise.all([
      this.courseRepository.findByTutor(dto.tutorId, filter, skip, limit),
      this.courseRepository.countByTutor(dto.tutorId, filter),
    ]);

    return {
      courses:    courses.map(c => CourseMapper.toTutorListItem(c)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}