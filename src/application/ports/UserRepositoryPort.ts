import { User } from "../../domain/entities/User";
import { Email } from "../../domain/value-objects/Email";

export interface UserRepositoryPort {
    findByEmail(email:Email): Promise<User | null>;
    create(user: User): Promise<void>;
}