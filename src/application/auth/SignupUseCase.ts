import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserReaderPort } from '../ports/UserReaderPort';
import { UserWriterPort } from '../ports/UserWriterPort';
import { PasswordHasherPort } from '../ports/PasswordHasherPort';
import { TokenServicePort } from '../ports/TokenServicePort';
import { OtpServicePort } from '../ports/OtpServicePort';
import { CreateRefreshTokenPort } from '../ports/CreateRefreshTokenPort';
import { Password } from '../../domain/value-objects/Password';
import { Email } from '../../domain/value-objects/Email';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { User } from '../../domain/entities/User';
import { UserRole } from '../../domain/entities/UserRole';

interface SignupInput {
  email:      string;
  password:   string;
  otp:        string;
  firstName?: string;
  lastName?:  string;
}

interface SignupOutput {
  user: { id: string; email: string; role: UserRole };
  accessToken:  string;
  refreshToken: string;
}

@injectable()
export class SignupUseCase {
  constructor(
    @inject(TYPES.UserReaderPort)
    private readonly userReader: UserReaderPort,
    @inject(TYPES.UserWriterPort)
    private readonly userWriter: UserWriterPort,
    @inject(TYPES.PasswordHasherPort)
    private readonly passwordHasher: PasswordHasherPort,
    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,
    @inject(TYPES.OtpServicePort)
    private readonly otpService: OtpServicePort,
    @inject(TYPES.CreateRefreshTokenPort)
    private readonly createRefreshTokenPort: CreateRefreshTokenPort,
  ) {}

  async execute(input: SignupInput): Promise<SignupOutput> {
    await this.otpService.verifyOtp(input.email, input.otp, 'signup');

    const email    = new Email(input.email);
    const password = new Password(input.password);

    const existingUser = await this.userReader.findByEmail(email);
    if (existingUser) {
      throw new ApplicationError('USER_ALREADY_EXISTS', 'User already exists');
    }

    const passwordHash = await this.passwordHasher.hash(password.getValue());
    const user         = User.create({ email, passwordHash, emailVerified: true });

    if (input.firstName || input.lastName) {
      user.updateProfile(input.firstName, input.lastName);
    }

    const savedUser = await this.userWriter.create(user);
    if (!savedUser.id) {
      throw new ApplicationError('INTERNAL_ERROR', 'User registration failed');
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: savedUser.id,
      role:   savedUser.role,
    });
    const { token: refreshToken } = await this.createRefreshTokenPort.execute(savedUser.id);

    return {
      user: {
        id:    savedUser.id,
        email: savedUser.email.getValue(),
        role:  savedUser.role,
      },
      accessToken,
      refreshToken,
    };
  }
}