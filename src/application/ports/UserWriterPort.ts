import { OAuthProvider } from '../../domain/entities/OAuthConnection';
import { User } from '../../domain/entities/User';

export interface UserWriterPort {
  create(user: User): Promise<User>;
  update(user: User): Promise<void>;
  updateRole(userId: string, role: number): Promise<void>;
  createOAuthUser(data: {
    email: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
    provider: OAuthProvider;
    providerId: string;
  }):Promise<User>;
}