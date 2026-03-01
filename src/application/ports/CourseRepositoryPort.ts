import { Course, CourseStatus } from '../../domain/entities/Course';

export interface TutorCourseFilter {
  status?: CourseStatus;
}

export interface CourseRepositoryPort {
  create(course: Course): Promise<void>;
  findById(id: string): Promise<Course | null>;
  findByIdAndTutor(id: string, tutorId: string): Promise<Course | null>;
  update(course: Course): Promise<void>;
  delete(id: string): Promise<void>;
  findByTutor(tutorId: string, filter: TutorCourseFilter, skip: number, limit: number): Promise<Course[]>;
  countByTutor(tutorId: string, filter: TutorCourseFilter): Promise<number>;
}