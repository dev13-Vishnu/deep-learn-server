import { User } from '../../domain/entities/User';
import { ApplicantSnapshot } from '../dto/instructor/InstructorApplicationData.dto';
import { AppError } from '../../shared/errors/AppError';

export class UserMapper {
  static toApplicantSnapshot(user: User): ApplicantSnapshot {
    if (!user) {
      throw new AppError('Cannot map null User entity to ApplicantSnapshot', 500);
    }

    return {
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      email: user.email.getValue(),
      avatarUrl: user.avatar ?? null,
    };
  }
}