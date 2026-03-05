import { CourseBasicDTO } from './CourseData.dto';
import { CourseCategory, CourseLevel } from '../../../domain/entities/Course';

export interface CreateCourseRequestDTO {
  tutorId:      string;
  title:        string;
  subtitle?:    string | null;
  description:  string;
  category:     CourseCategory;
  level:        CourseLevel;
  language:     string;
  price?:       number;
  currency?:    string;
  tags?:        string[];
}

export interface CreateCourseResponseDTO {
  message: string;
  course:  CourseBasicDTO;
}