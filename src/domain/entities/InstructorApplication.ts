export class InstructorApplication {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bio: string,
    public readonly experienceYears: string,
    public readonly teachingExperience: 'yes' | 'no',
    public readonly courseIntent: string,
    public readonly level: 'beginner' | 'intermediate' | 'advanced',
    public readonly language: string,
    public status: 'pending' | 'approved' | 'rejected',
    public rejectionReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}