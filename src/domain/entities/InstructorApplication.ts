import { DomainError } from "../errors/DomainError";

export class InstructorApplication {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bio: string,
    public readonly experienceYears: string,
    public readonly teachingExperience: 'yes' | 'no',
    public readonly courseIntent: string,
    public readonly level: 'beginner' | 'intermediate' | 'advanced',
    public readonly language: string,
    private _status: 'pending' | 'approved' | 'rejected',
    private _rejectionReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateBio(bio);
    this.validateCourseIntent(courseIntent);
  }

  // ✅ Factory method for creation
  public static create(
    id: string,
    userId: string,
    bio: string,
    experienceYears: string,
    teachingExperience: 'yes' | 'no',
    courseIntent: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    language: string
  ): InstructorApplication {
    return new InstructorApplication(
      id,
      userId,
      bio,
      experienceYears,
      teachingExperience,
      courseIntent,
      level,
      language,
      'pending',  // Always starts as pending
      null,
      new Date(),
      new Date()
    );
  }

  // ✅ Factory method for reconstruction (from DB)
  public static reconstruct(
    id: string,
    userId: string,
    bio: string,
    experienceYears: string,
    teachingExperience: 'yes' | 'no',
    courseIntent: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    language: string,
    status: 'pending' | 'approved' | 'rejected',
    rejectionReason: string | null,
    createdAt: Date,
    updatedAt: Date
  ): InstructorApplication {
    return new InstructorApplication(
      id,
      userId,
      bio,
      experienceYears,
      teachingExperience,
      courseIntent,
      level,
      language,
      status,
      rejectionReason,
      createdAt,
      updatedAt
    );
  }

  // ✅ Business validation
  private validateBio(bio: string): void {
    if (bio.length < 50) {
      throw new DomainError('Bio must be at least 50 characters');
    }
    if (bio.length > 1000) {
      throw new DomainError('Bio must not exceed 1000 characters');
    }
  }

  private validateCourseIntent(courseIntent: string): void {
    if (courseIntent.length < 20) {
      throw new DomainError('Course intent must be at least 20 characters');
    }
    if (courseIntent.length > 500) {
      throw new DomainError('Course intent must not exceed 500 characters');
    }
  }

  // ✅ Business behavior: Approve
  public approve(): void {
    if (this._status === 'approved') {
      throw new DomainError('Application is already approved');
    }
    if (this._status === 'rejected') {
      throw new DomainError('Cannot approve a rejected application');
    }
    this._status = 'approved';
    this._rejectionReason = null;
  }

  // ✅ Business behavior: Reject
  public reject(reason: string): void {
    if (!reason || reason.trim().length === 0) {
      throw new DomainError('Rejection reason is required');
    }
    if (this._status === 'rejected') {
      throw new DomainError('Application is already rejected');
    }
    if (this._status === 'approved') {
      throw new DomainError('Cannot reject an approved application');
    }
    this._status = 'rejected';
    this._rejectionReason = reason;
  }

  // ✅ Business query: Can be approved?
  public canBeApproved(): boolean {
    return this._status === 'pending';
  }

  // ✅ Business query: Is approved?
  public isApproved(): boolean {
    return this._status === 'approved';
  }

  // ✅ Business query: Is pending?
  public isPending(): boolean {
    return this._status === 'pending';
  }

  // ✅ Getters (encapsulation)
  public get status(): string {
    return this._status;
  }

  public get rejectionReason(): string | null {
    return this._rejectionReason;
  }
}