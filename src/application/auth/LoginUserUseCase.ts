import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { AppError } from '../../shared/errors/AppError';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types'

import { PasswordHasherPort } from '../ports/PasswordHasherPort';
import { TokenServicePort } from '../ports/TokenServicePort';


interface LoginUserInput {
  email: string;
  password: string;
}

@injectable()
export class LoginUserUseCase {
  constructor (
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepo: UserRepositoryPort,

    @inject(TYPES.PasswordHasherPort)
    private readonly passwordHasher: PasswordHasherPort,

    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort
  ) {}
  async execute(input: LoginUserInput) {
    const email = new Email(input.email);
    const password = new Password(input.password);

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatch = this.passwordHasher.compare(
      password.getValue(),
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.id) {
  throw new AppError('User identity not initialized', 500);
}

const accessToken = this.tokenService.generateAccessToken({
  userId: user.id,
  role: user.role,
});


    return {
      user: {
        id: user.id,
        email: user.email.getValue(),
        role: user.role,
      },
      accessToken,
    };
  }
}
