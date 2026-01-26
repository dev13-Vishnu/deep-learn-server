export type InstructorApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'blocked';

export interface InstructorApplication {
  id: string;
  userId: string;

  bio: string;
  experienceYears: string;
  teachingExperience: 'yes' | 'no';
  courseIntent: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;

  status: InstructorApplicationStatus;
  adminFeedback?: string;

  createdAt: Date;
  updatedAt: Date;
}
