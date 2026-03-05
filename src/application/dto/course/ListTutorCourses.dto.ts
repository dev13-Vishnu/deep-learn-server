import { TutorCourseListItemDTO } from './CourseData.dto';
import { CourseStatus } from '../../../domain/entities/Course';

export interface ListTutorCoursesRequestDTO {
  tutorId: string;
  page?:   number;
  limit?:  number;
  status?: CourseStatus;
}

export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface ListTutorCoursesResponseDTO {
  courses:    TutorCourseListItemDTO[];
  pagination: PaginationMeta;
}