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

    public firstName?:string,
    public lastName?: string,
    public bio?: string,
    public avatarUrl?: string,
    
  ) {}

  public changePassword(hashedPassword: string): void {
    this.passwordHash = hashedPassword;
  }

  public getPassword(): string {
    return this.passwordHash;
  }

  updateProfile (data: {
    firstName?:string;
    lastName?:string;
    bio?:string;
    avatarUrl?:string;
  }) {
    if (data.firstName !== undefined) this.firstName = data.firstName;
    if (data.lastName !== undefined) this.lastName = data.lastName;
    if (data.bio !== undefined) this.bio = data.bio;
    if (data.avatarUrl !== undefined) this.avatarUrl = data.avatarUrl;
  }
}
