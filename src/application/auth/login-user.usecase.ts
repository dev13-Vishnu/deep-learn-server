import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { AppError } from '../../shared/errors/AppError';
import { PasswordHasher } from '../../infrastructure/security/password-hasher';
import { JwtService } from '../../infrastructure/security/jwt.services';

interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(input: LoginUserInput) {
    const email = new Email(input.email);
    const password = new Password(input.password);

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatch = await PasswordHasher.compare(
      password.getValue(),
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.id) {
  throw new AppError('User identity not initialized', 500);
}

const accessToken = JwtService.sign({
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
