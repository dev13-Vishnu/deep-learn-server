import { InstructorApplicationData } from './InstructorApplicationData.dto';

export interface ApplyForInstructorRequestDTO {
  userId: string;
  bio: string;
  experienceYears: string;
  teachingExperience: 'yes' | 'no';
  courseIntent: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
}

export interface ApplyForInstructorResponseDTO {
  message: string;
  application: InstructorApplicationData;
}