import { UserRole } from '../../../../domain/entities/UserRole';

export interface ISignupUseCase {
  execute(input: {
    email:      string;
    password:   string;
    otp:        string;
    firstName?: string;
    lastName?:  string;
  }): Promise<{
    user:         { id: string; email: string; role: UserRole };
    accessToken:  string;
    refreshToken: string;
  }>;
}