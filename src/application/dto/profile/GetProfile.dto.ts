import { UserRole } from '../../../domain/entities/UserRole';

export interface GetProfileRequestDTO {
  userId: string;
}

export interface GetProfileResponseDTO {
  id: string;
  email: string;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  avatarUrl: string | null | undefined;
  bio: string | null | undefined;
  role: UserRole;
}