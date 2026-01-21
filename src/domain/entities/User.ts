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
    
  ) {}

  public changePassword(hashedPassword: string): void {
    this.passwordHash = hashedPassword;
  }

  public getPassword(): string {
    return this.passwordHash;
  }
}
