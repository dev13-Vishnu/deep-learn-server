import { Email } from "../../domain/value-objects/Email";
import { User } from "../../domain/entities/User";

export interface UserRepositoryPort {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  update(user: User): Promise<void>;
  updateRole(userId: string, role: number): Promise<void>;
}
