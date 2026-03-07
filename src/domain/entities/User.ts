import { Email } from '../value-objects/Email';
import { UserRole } from './UserRole';
import { DomainError } from '../errors/DomainError';
import { InstructorState } from './InstructorState';

const VALID_TRANSITIONS: Record<InstructorState, InstructorState[]> = {
  not_applied: ['pending'],
  pending:     ['approved', 'rejected'],
  approved:    [],
  rejected:    ['pending'],
};

export class User {
  private _instructorState: InstructorState;
  private _role:         UserRole;
  private _passwordHash: string | null;
  private _firstName:    string | null;
  private _lastName:     string | null;
  private _bio:          string | null;
  private _avatar:       string | null;

  constructor(
    public readonly email:         Email,
    role:                          UserRole,
    passwordHash:                  string | null,
    public readonly isActive:      boolean = true,
    public readonly emailVerified: boolean = false,
    public readonly id?:           string,
    firstName?:                    string | null,
    lastName?:                     string | null,
    bio?:                          string | null,
    avatar?:                       string | null,
    instructorState?:              InstructorState | null,
  ) {
    this._role            = role;
    this._passwordHash    = passwordHash;
    this._firstName       = firstName    ?? null;
    this._lastName        = lastName     ?? null;
    this._bio             = bio          ?? null;
    this._avatar          = avatar       ?? null;
    this._instructorState = instructorState ?? 'not_applied';
  }

  // ── Static factory ────────────────────────────────────────────────────────
  static create(params: {
    email:          Email;
    passwordHash:   string | null;
    role?:          UserRole;
    isActive?:      boolean;
    emailVerified?: boolean;
  }): User {
    return new User(
      params.email,
      params.role          ?? UserRole.STUDENT,
      params.passwordHash,
      params.isActive      ?? true,
      params.emailVerified ?? false,
    );
  }

  // ── Getters ───────────────────────────────────────────────────────────────
  get role():             UserRole      { return this._role; }
  get passwordHash():     string | null { return this._passwordHash; }
  get firstName():        string | null { return this._firstName; }
  get lastName():         string | null { return this._lastName; }
  get bio():              string | null { return this._bio; }
  get avatar():           string | null { return this._avatar; }
  get instructorState():  InstructorState { return this._instructorState; }

  // ── State machine ─────────────────────────────────────────────────────────
  public setInstructorState(newState: InstructorState): void {
    const allowed = VALID_TRANSITIONS[this._instructorState];
    if (!allowed.includes(newState)) {
      throw new DomainError(
        `Cannot transition instructorState from '${this._instructorState}' to '${newState}'`
      );
    }
    this._instructorState = newState;
  }

  // ── Domain methods ────────────────────────────────────────────────────────
  public canApplyAsInstructor(): boolean {
    return this._role === UserRole.STUDENT && this.isActive && this.emailVerified;
  }

  public upgradeToInstructor(): void {
    if (this._role !== UserRole.STUDENT) {
      throw new DomainError('Only students can be upgraded to instructors');
    }
    if (!this.isActive) {
      throw new DomainError('Inactive users cannot become instructors');
    }
    if (!this.emailVerified) {
      throw new DomainError('Email must be verified to become an instructor');
    }
    this._role = UserRole.TUTOR;
    this.setInstructorState('approved');
  }

  public changePassword(hashedPassword: string): void {
    if (!hashedPassword || hashedPassword.trim().length === 0) {
      throw new DomainError('Hashed password cannot be empty');
    }
    this._passwordHash = hashedPassword;
  }

  public getPassword(): string | null {
    return this._passwordHash;
  }

  public updateProfile(
    firstName?: string,
    lastName?:  string,
    bio?:       string,
  ): void {
    if (firstName !== undefined) {
      this.validateName(firstName);
      this._firstName = firstName;
    }
    if (lastName !== undefined) {
      this.validateName(lastName);
      this._lastName = lastName;
    }
    if (bio !== undefined) {
      this.validateBio(bio);
      this._bio = bio;
    }
  }

  public updateAvatar(avatarUrl: string | null): void {
    if (avatarUrl !== null && !this.isValidUrl(avatarUrl)) {
      throw new DomainError('Invalid avatar URL');
    }
    this._avatar = avatarUrl;
  }

  // ── Private validators ────────────────────────────────────────────────────
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

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}