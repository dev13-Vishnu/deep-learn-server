
export interface InstructorApplicationData {
  id: string;
  userId: string;
  bio: string;
  experienceYears: string;
  teachingExperience: 'yes' | 'no';
  courseIntent: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  cooldownExpiresAt: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicantSnapshot {
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
}