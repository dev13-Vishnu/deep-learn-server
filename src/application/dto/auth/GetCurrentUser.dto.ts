import { InstructorState } from '../../../domain/entities/InstructorState';
import { UserRole } from '../../../domain/entities/UserRole';

export interface GetCurrentUserRequestDTO {
  userId: string;
}

export interface GetCurrentUserResponseDTO {
  id: string;
  email: string;
  role: UserRole;
  instructorState: InstructorState | null;
  profile: {
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    avatar: string | null;
  };
}