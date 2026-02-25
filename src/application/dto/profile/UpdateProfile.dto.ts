export interface UpdateProfileRequestDTO {
  userId: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export interface UpdateProfileResponseDTO {
  id: string;
  email: string;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  avatarUrl: string | null | undefined;
  bio: string | null | undefined;
}