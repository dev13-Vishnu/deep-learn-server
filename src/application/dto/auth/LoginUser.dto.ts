import { InstructorState } from '../../../domain/entities/InstructorState';
import { UserRole } from '../../../domain/entities/UserRole';

export interface LoginUserRequestDTO {
  email: string;
  password: string;
}

export interface LoginUserResponseDTO {
  user: {
    id: string;
    email: string;
    role: UserRole;
    instructorState: InstructorState | null;
  };
  accessToken: string;
  refreshToken: string;
}