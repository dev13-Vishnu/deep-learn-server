import { Course, CourseStatus } from '../../domain/entities/Course';

export interface TutorCourseFilter {
  status?: CourseStatus;
}

export type PublicCourseSort =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'popular';

export interface PublicCourseFilter {
  category?:  string;
  level?:     string;
  language?:  string;
  minPrice?:  number;
  maxPrice?:  number;
  search?:    string;
  sort?:      PublicCourseSort;
}

export interface CourseRepositoryPort {
  create(course: Course): Promise<void>;
  findById(id: string): Promise<Course | null>;
  findByIdAndTutor(id: string, tutorId: string): Promise<Course | null>;
  update(course: Course): Promise<void>;
  delete(id: string): Promise<void>;
  findByTutor(tutorId: string, filter: TutorCourseFilter, skip: number, limit: number): Promise<Course[]>;
  countByTutor(tutorId: string, filter: TutorCourseFilter): Promise<number>;
  findPublished(filter: PublicCourseFilter, skip: number, limit: number): Promise<Course[]>;
  countPublished(filter: PublicCourseFilter): Promise<number>;

}