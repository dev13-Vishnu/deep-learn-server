import { DomainError } from '../errors/DomainError';
import { Email } from '../value-objects/Email';
import { InstructorState } from './InstructorState';
import { UserRole } from './UserRole';

const VALID_TRANSITIONS: Record<InstructorState, InstructorState[]> = {
  not_applied: ['pending'],
  pending: ['approved', 'rejected'],
  approved: [],
  rejected: ['pending'],
};

export class User {
  private _instructorState: InstructorState;

  constructor(
    public readonly email: Email,
    public  role: UserRole,
    public passwordHash: string | null,
    public readonly isActive: boolean = true,
    public readonly emailVerified: boolean = false,
    public readonly id?: string,

    public firstName?: string | null,
    public lastName?: string | null,
    public bio?: string | null,
    public avatar?: string | null,

    instructorState?: InstructorState | null
  ) {
    this._instructorState = instructorState ?? 'not_applied';
  }

  get instructorState(): InstructorState {
    return this._instructorState;
  }

  public setInstructorState(newState: InstructorState): void {
    const allowed = VALID_TRANSITIONS[this._instructorState];
    if (!allowed.includes(newState)) {
      throw new DomainError(
        `Cannot transition instructorState from '${this._instructorState}' to '${newState}'`
      );
    }
    this._instructorState = newState;
  }

  public canApplyAsInstructor(): boolean {
    return this.role === UserRole.STUDENT && this.isActive && this.emailVerified;
  }

  public upgradeToInstructor(): void {
  if (this.role !== UserRole.STUDENT) {
    throw new DomainError('Only students can be upgraded to instructors');
  }
  if (!this.isActive) {
    throw new DomainError('Inactive users cannot become instructors');
  }
  if (!this.emailVerified) {
    throw new DomainError('Email must be verified to become an instructor');
  }

  this.role = UserRole.TUTOR;
  this.setInstructorState('approved');
}

  public changePassword(hashedPassword: string): void {
    if (!hashedPassword || hashedPassword.trim().length === 0) {
      throw new DomainError('Hashed password cannot be empty');
    }
    this.passwordHash = hashedPassword;
  }

  public getPassword(): string | null {
    return this.passwordHash;
  }

  public updateProfile(
    firstName?: string,
    lastName?: string,
    bio?: string
  ): void {
    if (firstName !== undefined) {
      this.validateName(firstName);
      this.firstName = firstName;
    }
    if (lastName !== undefined) {
      this.validateName(lastName);
      this.lastName = lastName;
    }
    if (bio !== undefined) {
      this.validateBio(bio);
      this.bio = bio;
    }
  }

  private validateName(name: string): void {
    if (name.trim().length === 0) {
      throw new DomainError('Name cannot be empty');
    }
    if (name.length > 100) {
      throw new DomainError('Name cannot exceed 100 characters');
    }
  }

  private validateBio(bio: string): void {
    if (bio.length > 500) {
      throw new DomainError('Bio cannot exceed 500 characters');
    }
  }

  public updateAvatar(avatarUrl: string | null): void {
    if (avatarUrl !== null && !this.isValidUrl(avatarUrl)) {
      throw new DomainError('Invalid avatar URL');
    }
    this.avatar = avatarUrl;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}