export interface InstructorStatusResult {
  hasApplication: boolean;
  application?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason: string | null;
    cooldownExpiresAt: Date | null;
    bio: string;
    experienceYears: string;
    teachingExperience: 'yes' | 'no';
    courseIntent: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    language: string;
    createdAt: Date;
    updatedAt: Date;
  };
}