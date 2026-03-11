import { User } from '../../domain/entities/User';
import { ApplicantSnapshot } from '../dto/instructor/InstructorApplicationData.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

export class UserMapper {
  static toApplicantSnapshot(user: User): ApplicantSnapshot {
    if (!user) {
      throw new ApplicationError('INTERNAL_ERROR', 'Cannot map null User entity to ApplicantSnapshot');
    }
    return {
      firstName: user.firstName ?? null,
      lastName:  user.lastName  ?? null,
      email:     user.email.getValue(),
      avatarUrl: user.avatar    ?? null,
    };
  }
}