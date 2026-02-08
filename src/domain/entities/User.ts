import { DomainError } from "../errors/DomainError";
import { Email } from "../value-objects/Email";
import { UserRole } from "./UserRole";

export class User {
  constructor(
    public readonly email: Email,
    public readonly role: UserRole,
    public  passwordHash: string,
    public readonly isActive: boolean = true,
    public readonly emailVerified: boolean = false,
    public readonly id?: string, // assigned by repository

    public firstName?:string | null,
    public lastName?: string | null,
    public bio?: string | null,
    public avatar?: string | null,
    
  ) {}

   // ✅ Business behavior: Can apply as instructor?
  public canApplyAsInstructor(): boolean {
    return this.role === UserRole.STUDENT && this.isActive && this.emailVerified;
  }

  // ✅ Business behavior: Upgrade to instructor
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
    // Note: Role is readonly, so we need a different approach
    // We'll handle this in the use case with repository.updateRole()
  }

  // ✅ Business behavior: Change password
  public changePassword(hashedPassword: string): void {
    if (!hashedPassword || hashedPassword.trim().length === 0) {
      throw new DomainError('Hashed password cannot be empty');
    }
    this.passwordHash = hashedPassword;
  }

  public getPassword(): string {
    return this.passwordHash;
  }

  public updateProfile (
    firstName?:string,
    lastName?:string,
    bio?:string,
  ):void {
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

  // ✅ Business validation: Avatar
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
