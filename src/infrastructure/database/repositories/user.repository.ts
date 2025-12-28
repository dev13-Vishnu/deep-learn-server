import { UserModel } from '../models/user.model';

export interface CreateUserDTO {
  email: string;
  passwordHash: string;
  role: 'student' | 'tutor' | 'admin';
}

export class UserRepository {
  async findByEmail(email: string) {
    return UserModel.findOne({ email }).lean();
  }

  async create(data: CreateUserDTO) {
    return UserModel.create(data);
  }
}
