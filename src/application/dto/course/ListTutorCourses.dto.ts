import { TutorCourseListItemDTO } from './CourseData.dto';

export interface ListTutorCoursesRequestDTO {
  tutorId: string;
  page?:   number;
  limit?:  number;
  status?: 'draft' | 'published' | 'archived';
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