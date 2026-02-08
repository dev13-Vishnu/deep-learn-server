import { User } from '../../domain/entities/User';

export interface UserWriterPort {
  create(user: User): Promise<User>;
  update(user: User): Promise<void>;
  updateRole(userId: string, role: number): Promise<void>;
}