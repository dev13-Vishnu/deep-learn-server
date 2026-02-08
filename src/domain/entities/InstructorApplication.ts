export class InstructorApplication {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bio: string,
    public readonly experienceYears: string,
    public readonly teachingExperience: string,
    public readonly courseIntent: string,
    public readonly level: string,
    public readonly language: string,
    public status: 'pending' | 'approved' | 'rejected',
    public rejectionReason: string | null,  // ← ADD
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}