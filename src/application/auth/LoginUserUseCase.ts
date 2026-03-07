import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { AppError } from '../../shared/errors/AppError';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';

import { PasswordHasherPort } from '../ports/PasswordHasherPort';
import { TokenServicePort } from '../ports/TokenServicePort';
import { CreateRefreshTokenPort } from '../ports/CreateRefreshTokenPort';
import { LoginUserRequestDTO, LoginUserResponseDTO } from '../dto/auth/LoginUser.dto';

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepo: UserRepositoryPort,

    @inject(TYPES.PasswordHasherPort)
    private readonly passwordHasher: PasswordHasherPort,

    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,

    @inject(TYPES.CreateRefreshTokenPort)
    private readonly createRefreshTokenPort: CreateRefreshTokenPort
  ) {}

  async execute(input: LoginUserRequestDTO): Promise<LoginUserResponseDTO> {
    const email = new Email(input.email);
    const password = new Password(input.password);

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.passwordHash) {
      throw new AppError(
        'This account uses social login. Please sign in with your provider.',
        400
      );
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

    // Create refresh token via port
    const { token: refreshToken } =
      await this.createRefreshTokenPort.execute(user.id);

    return {
      user: {
        id: user.id,
        email: user.email.getValue(),
        role: user.role,
        instructorState: user.instructorState ?? null,
      },
      accessToken,
      refreshToken,
    };
  }
}