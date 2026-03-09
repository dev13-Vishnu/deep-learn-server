import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { PasswordHasherPort } from '../ports/PasswordHasherPort';
import { TokenServicePort } from '../ports/TokenServicePort';
import { LoginUserRequestDTO, LoginUserResponseDTO } from '../dto/auth/LoginUser.dto';
import { ILoginUserUseCase } from '../ports/inbound/auth/ILoginUserUseCase';
import { RefreshTokenService } from '../services/RefreshTokenService';

@injectable()
export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepo: UserRepositoryPort,
    @inject(TYPES.PasswordHasherPort)
    private readonly passwordHasher: PasswordHasherPort,
    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,
    @inject(TYPES.RefreshTokenService)
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(input: LoginUserRequestDTO): Promise<LoginUserResponseDTO> {
    const email    = new Email(input.email);
    const password = new Password(input.password);

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new ApplicationError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new ApplicationError(
        'SOCIAL_LOGIN_REQUIRED',
        'This account uses social login. Please sign in with your provider.'
      );
    }

    const passwordMatch = await this.passwordHasher.compare(
      password.getValue(),
      user.passwordHash
    );
    if (!passwordMatch) {
      throw new ApplicationError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.id) {
      throw new ApplicationError('INTERNAL_ERROR', 'User ID not found');
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role:   user.role,
    });
    const { token: refreshToken } = await this.refreshTokenService.create(user.id);

    return {
      user: {
        id:              user.id,
        email:           user.email.getValue(),
        role:            user.role,
        instructorState: user.instructorState ?? null,
      },
      accessToken,
      refreshToken,
    };
  }
}