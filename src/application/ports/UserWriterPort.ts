import { UserRole } from '../../domain/entities/UserRole';
import { OAuthProvider } from '../../domain/entities/OAuthConnection';
import { User } from '../../domain/entities/User';

export interface UserWriterPort {
  create(user: User): Promise<User>;
  update(user: User): Promise<void>;
  // ADD this method
  updateRole(userId: string, role: UserRole): Promise<void>;
  createOAuthUser(data: {
    email:      string;
    firstName:  string;
    lastName?:  string;
    avatar?:    string;
    provider:   OAuthProvider;
    providerId: string;
  }): Promise<User>;
}