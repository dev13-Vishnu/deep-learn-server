import { CourseBasicDTO } from './CourseData.dto';
import { CourseCategory, CourseLevel } from '../../../domain/entities/Course';

export interface UpdateCourseRequestDTO {
  courseId: string;
  tutorId:  string;

  title?:       string;
  subtitle?:    string | null;
  description?: string;
  category?:    CourseCategory;
  level?:       CourseLevel;
  language?:    string;
  price?:       number;
  currency?:    string;
  tags?:        string[];
}

export interface UpdateCourseResponseDTO {
  message: string;
  course:  CourseBasicDTO;
}