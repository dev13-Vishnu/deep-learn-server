import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';

export interface UserReaderPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}