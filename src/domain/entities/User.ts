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
    public avatarUrl?: string | null,
    
  ) {}

  public changePassword(hashedPassword: string): void {
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
    if (firstName !== undefined) this.firstName = firstName;
    if (lastName !== undefined) this.lastName = lastName;
    if (bio !== undefined) this.bio = bio;
  }

  public updateAvatar(avatarUrl: string | null) : void {
    this.avatarUrl = avatarUrl;
  }
}
