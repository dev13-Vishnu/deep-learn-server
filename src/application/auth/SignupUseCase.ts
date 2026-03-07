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
import { AppError } from '../../shared/errors/AppError';
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
  user: {
    id:    string;
    email: string;
    role:  UserRole;
  };
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
    // 1. Verify OTP (throws if invalid/expired)
    await this.otpService.verifyOtp(input.email, input.otp, 'signup');

    // 2. Validate value objects
    const email    = new Email(input.email);
    const password = new Password(input.password);

    // 3. Duplicate check
    const existingUser = await this.userReader.findByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    // 4. Hash password
    const passwordHash = await this.passwordHasher.hash(password.getValue());

    // 5. Create domain entity via factory
    const user = User.create({
      email,
      passwordHash,
      emailVerified: true, // OTP already verified above
    });

    // 6. Attach optional profile fields
    if (input.firstName || input.lastName) {
      user.updateProfile(input.firstName, input.lastName);
    }

    // 7. Persist
    const savedUser = await this.userWriter.create(user);

    if (!savedUser.id) {
      throw new AppError('User registration failed', 500);
    }

    // 8. Issue tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: savedUser.id,
      role:   savedUser.role,
    });

    const { token: refreshToken } =
      await this.createRefreshTokenPort.execute(savedUser.id);

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