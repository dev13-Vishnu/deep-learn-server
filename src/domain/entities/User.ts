import { Email } from "../value-objects/Email";
import { UserRole } from "./UserRole";

export class User {
    constructor (
        public readonly id: string,
        public readonly email: Email,
        public readonly role: UserRole,
        public readonly passwordHash: string,
        public readonly isActive :boolean = true,
        public readonly emailVerified: boolean = false,
    ) {} 
}