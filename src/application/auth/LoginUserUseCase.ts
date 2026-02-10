import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { AppError } from '../../shared/errors/AppError';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';

import { PasswordHasherPort } from '../ports/PasswordHasherPort';
import { TokenServicePort } from '../ports/TokenServicePort';
import { UserRole } from '../../domain/entities/UserRole';
import { CreateRefreshTokenUseCase } from './CreateRefreshTokenUseCase';

// ✅ ADD THIS MISSING INTERFACE
interface LoginUserInput {
  email: string;
  password: string;
}

interface LoginUserOutput {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepo: UserRepositoryPort,

    @inject(TYPES.PasswordHasherPort)
    private readonly passwordHasher: PasswordHasherPort,

    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,

    @inject(TYPES.CreateRefreshTokenUseCase)
    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const email = new Email(input.email);
    const password = new Password(input.password);

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatch = await this.passwordHasher.compare(
      password.getValue(),
      user.passwordHash
    );

    if (!passwordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.id) {
      throw new AppError('User ID not found', 500);
    }

    // Generate access token
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    // Create refresh token
    const { token: refreshToken } =
      await this.createRefreshTokenUseCase.execute(user.id);

    return {
      user: {
        id: user.id,
        email: user.email.getValue(),
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}