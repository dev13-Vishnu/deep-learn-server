import { DomainError } from '../errors/DomainError';

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
    private _cooldownExpiresAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateBio(bio);
    this.validateCourseIntent(courseIntent);
  }

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
      'pending',
      null,
      null,
      new Date(),
      new Date()
    );
  }

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
    cooldownExpiresAt: Date | null,
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
      cooldownExpiresAt,
      createdAt,
      updatedAt
    );
  }

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

  public approve(): void {
    if (this._status === 'approved') {
      throw new DomainError('Application is already approved');
    }
    if (this._status === 'rejected') {
      throw new DomainError('Cannot approve a rejected application');
    }
    this._status = 'approved';
    this._rejectionReason = null;
    this._cooldownExpiresAt = null;
  }

  public reject(reason: string, cooldownExpiresAt: Date): void {
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
    this._cooldownExpiresAt = cooldownExpiresAt;
  }

  public canBeApproved(): boolean {
    return this._status === 'pending';
  }

  public isApproved(): boolean {
    return this._status === 'approved';
  }

  public isPending(): boolean {
    return this._status === 'pending';
  }

  public isCooldownActive(): boolean {
    return this._cooldownExpiresAt !== null && this._cooldownExpiresAt > new Date();
  }

  public get status(): 'pending' | 'approved' | 'rejected' {
    return this._status;
  }

  public get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  public get cooldownExpiresAt(): Date | null {
    return this._cooldownExpiresAt;
  }
}