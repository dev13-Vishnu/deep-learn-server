import { Email } from "../../domain/value-objects/Email";
import { User } from "../../domain/entities/User";

export interface UserRepositoryPort {
  findByEmail(email: Email): Promise<User | null>;
  create(user: User): Promise<User>;
}
