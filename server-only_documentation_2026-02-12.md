# Project: server-only
**Documentation Generated on:** 2/12/2026, 10:30:06 PM

---
## File: server-only\package.json
```json
{
  "name": "deep-learn-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "ts-node-dev --respawn --transpile-only src/bootstrap.ts",
    "build": "tsc",
    "start": "node dist/bootstrap.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.985.0",
    "@aws-sdk/s3-request-presigner": "^3.985.0",
    "bcrypt": "^6.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "inversify": "^7.11.0",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.0.2",
    "multer": "^2.0.2",
    "multer-s3": "^3.0.1",
    "nodemailer": "^7.0.12",
    "redis": "^5.10.0",
    "reflect-metadata": "^0.2.2",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/bcrypt": "^6.0.0",
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/multer": "^2.0.0",
    "@types/multer-s3": "^3.0.3",
    "@types/node": "^25.0.3",
    "@types/nodemailer": "^7.0.5",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.9.3"
  }
}

```

---
## File: server-only\src\application\auth\CreateRefreshTokenUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import { RefreshToken } from '../../domain/entities/RefreshToken';
import crypto from 'crypto';

interface CreateRefreshTokenOutput {
  token: string;
  expiresAt: Date;
}

@injectable()
export class CreateRefreshTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort
  ) {}

  async execute(userId: string): Promise<CreateRefreshTokenOutput> {
    // Generate token
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.calculateExpiration();

    // Create domain entity
    const refreshToken = new RefreshToken(
      undefined,  // ID assigned by repository
      userId,
      tokenHash,
      expiresAt,
      new Date()
    );

    // SAVE TO DATABASE
    await this.refreshTokenRepository.create(refreshToken);

    return { token, expiresAt };
  }

  private generateToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private calculateExpiration(): Date {
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    return new Date(Date.now() + expiresIn);
  }
}
```

---
## File: server-only\src\application\auth\GetCurrentUserUseCase.ts
```ts
import { inject, injectable } from "inversify";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { TYPES } from "../../shared/di/types";
import { AppError } from "../../shared/errors/AppError";

@injectable()
export class GetCurrentUserUseCase {
    constructor (
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort
    ) {}
    
    async execute(userId: string) {
        const user = await this.userRepo.findById(userId);

        if(!user){
            throw new AppError ("Authenticated user not found",404);
        }

        if(!user.isActive) {
            throw new AppError('User accound is inactive',403);
        }

        return {
            id: user.id,
            email: user.email.getValue(),
            role: user.role,
            instructorState: user.instructorState ?? null,
            profile: {
                firstName: user.firstName ?? null,
                lastName: user.lastName ?? null,
                bio: user.bio ?? null,
                avatar: user.avatar ?? null,
            }
        };
    }
}
```

---
## File: server-only\src\application\auth\LoginUserUseCase.ts
```ts
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

// ADD THIS MISSING INTERFACE
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
```

---
## File: server-only\src\application\auth\LogoutUserUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import crypto from 'crypto';

@injectable()
export class LogoutUserUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort
  ) {}

  async execute(refreshToken: string): Promise<void> {
    // Hash the token to find it in database
    const tokenHash = this.hashToken(refreshToken);

    // Delete the refresh token from database
    await this.refreshTokenRepository.revoke(tokenHash);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
```

---
## File: server-only\src\application\auth\RefreshAccessTokenUseCase.ts
```ts
import { injectable, inject } from 'inversify';

import { TYPES } from '../../shared/di/types';
import { TokenServicePort } from '../ports/TokenServicePort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { authConfig } from '../../shared/config/auth.config';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import { RefreshToken } from '../../domain/entities/RefreshToken';



@injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort,

    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(plainToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {

    const tokenHash = this.tokenService.hashToken(plainToken);
    
    const existingToken =
      await this.refreshTokenRepository.findByHash(tokenHash);

    if (!existingToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (existingToken.expiresAt.getTime() < Date.now()) {
      await this.refreshTokenRepository.revoke(tokenHash);
      throw new AppError('Refresh token expired', 401);
    }

    const user = await this.userRepository.findById(existingToken.userId);

    if (!user || !user.id) {
      await this.refreshTokenRepository.revoke(tokenHash);
      throw new AppError('User not found', 401);
    }

    // Token rotation: revoke old refresh token
    await this.refreshTokenRepository.revoke(tokenHash);

    // Generate new refresh token
    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newRefreshTokenHash =
      this.tokenService.hashToken(newRefreshToken);

    const refreshTokenExpiresAt = new Date(
      Date.now() + authConfig.refreshToken.expiresInMs
    );

    const refreshToken = new RefreshToken(
      undefined,
      user.id,
      newRefreshTokenHash,
      refreshTokenExpiresAt,
      new Date(),
    );
    await this.refreshTokenRepository.create(refreshToken);

    // Generate new access token
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt,
    };
  }
}

```

---
## File: server-only\src\application\auth\RegisterUserUseCase.ts
```ts
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";

import { User } from "../../domain/entities/User";
import { UserRole } from "../../domain/entities/UserRole";
import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { AppError } from "../../shared/errors/AppError";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";



interface RegisterUserInput{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
@injectable()
export class RegisterUserUseCase{
    constructor(
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort,

        @inject(TYPES.PasswordHasherPort)
        private readonly passwordHasher: PasswordHasherPort
    ) {}
    async execute(input: RegisterUserInput): Promise<User> {
        const email = new Email(input.email);
        const password = new Password(input.password);

        const existingUser = await this.userRepo.findByEmail(email);
        if(existingUser) {
            throw new AppError ('User already exists', 409);
        }

        const passwordHash =await this.passwordHasher.hash(password.getValue());

        const user = new User(
            email,
            UserRole.STUDENT,
            passwordHash,
            true,
            true,
            undefined,
            input.firstName,
            input.lastName,
            null,
            null,
            'not_applied'
        );
        return this.userRepo.create(user);
    }
}
```

---
## File: server-only\src\application\auth\RequestPasswordResetOtpUseCase.ts
```ts
import { inject, injectable } from "inversify";
import { Email } from "../../domain/value-objects/Email";
import { OtpServicePort } from "../ports/OtpServicePort";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { TYPES } from "../../shared/di/types";

@injectable()
export class RequestPasswordResetOtpUseCase {
    constructor (
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort,

        @inject(TYPES.OtpServicePort)
        private readonly otpService: OtpServicePort
    ) {}

    async execute(emailRaw:string):Promise<void> {
        const email = new Email(emailRaw);

        const user = await this.userRepo.findByEmail(email);

        if(!user){
            return;
        }
        await this.otpService.requestOtp(email.getValue(), "forgot-password");

    }
}
```

---
## File: server-only\src\application\auth\RequestSignupOtpUseCase.ts
```ts
import { inject, injectable } from "inversify";
import { OtpServicePort } from "../ports/OtpServicePort";
import { TYPES } from "../../shared/di/types";

@injectable()
export class RequestSignupOtpUseCase {
    constructor(
        @inject(TYPES.OtpServicePort)
        private readonly otpService: OtpServicePort
    ) {}

    async execute (email: string): Promise<Date> {
        return this.otpService.requestOtp(email,'signup');
    }
}
```

---
## File: server-only\src\application\auth\ResetPasswordUseCase.ts
```ts
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";

import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepo: UserRepositoryPort,

    @inject(TYPES.PasswordHasherPort)
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async execute(emailRaw: string, newPasswordRaw: string): Promise<void> {
    const email = new Email(emailRaw);
    const newPassword = new Password(newPasswordRaw);

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return; // silent success
    }

    const hashedPassword = await this.passwordHasher.hash(
      newPassword.getValue()
    );

    user.changePassword(hashedPassword);

    await this.userRepo.update(user);
  }
}

```

---
## File: server-only\src\application\auth\RevokeRefreshTokenUseCase.ts
```ts
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { TokenServicePort } from "../ports/TokenServicePort";
import { RefreshTokenRepositoryPort } from "../ports/RefreshTokenRepositoryPort";

@injectable()
export class RevokeRefreshTokenUseCase {
    constructor (
        @inject(TYPES.RefreshTokenRepositoryPort)
        private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
        
        @inject(TYPES.TokenServicePort)
        private readonly tokenService: TokenServicePort,
    ) {}

    async execute(plainToken: string): Promise<void> {
        const tokenHash = this.tokenService.hashToken(plainToken)
        await this.refreshTokenRepository.revoke(tokenHash);
    }
}
```

---
## File: server-only\src\application\auth\SignupUseCase.ts
```ts
import { inject, injectable } from "inversify";
import { UserRole } from "../../domain/entities/UserRole";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { TYPES } from "../../shared/di/types";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";
import { TokenServicePort } from "../ports/TokenServicePort";
import { OtpServicePort } from "../ports/OtpServicePort";
import { CreateRefreshTokenUseCase } from "./CreateRefreshTokenUseCase";
import { Password } from "../../domain/value-objects/Password";
import { Email } from "../../domain/value-objects/Email";
import { AppError } from "../../shared/errors/AppError";
import { User } from "../../domain/entities/User";

interface SignupInput {
    email: string;
    password: string;
    otp: string;
    firstName?: string;
    lastName?: string;
}

interface SignupOutput {
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
    accessToken: string;
    refreshToken: string;
}

@injectable()
export class SignupUseCase {
    constructor(
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort,

        @inject(TYPES.PasswordHasherPort)
        private readonly passwordHasher: PasswordHasherPort,

        @inject(TYPES.TokenServicePort)
        private readonly tokenService: TokenServicePort,

        @inject(TYPES.OtpServicePort)
        private readonly otpService: OtpServicePort,

        @inject(TYPES.CreateRefreshTokenUseCase)
        private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,
    ) {}

    async execute (input: SignupInput): Promise<SignupOutput> {

        await this.otpService.verifyOtp(input.email, input.otp, 'signup');

        const email = new Email(input.email);
        const password = new Password(input.password);

        const existingUser = await this.userRepo.findByEmail(email);
        if (existingUser) {
            throw new AppError('User already exists', 409)
        }

        const passwordHash = await this.passwordHasher.hash(password.getValue());

        const user = new User(
            email,
            UserRole.STUDENT,
            passwordHash,
            true,
            true,
            undefined,
            input.firstName,
            input.lastName,
            null,
            null,
            'not_applied'
        );

        const savedUser = await this.userRepo.create(user);

        if(!savedUser.id) {
            throw new AppError('User registration failed', 500);
        }

        const accessToken = this.tokenService.generateAccessToken({
            userId: savedUser.id,
            role: savedUser.role,
        })

        const {token: refreshToken} = await this.createRefreshTokenUseCase.execute(savedUser.id);


        return {
            user: {
                id: savedUser.id ,
                email: savedUser.email.getValue() ,
                role: savedUser.role ,
            },
            accessToken,
            refreshToken,
        }
    }
}
```

---
## File: server-only\src\application\auth\VerifyPasswordResetOtpUseCase.ts
```ts
import { inject, injectable } from "inversify";
import { OtpServicePort } from "../ports/OtpServicePort";
import { TYPES } from "../../shared/di/types";

@injectable()
export class VerifyPasswordResetOtpUseCase {
    constructor ( 
        @inject(TYPES.OtpServicePort)
        private readonly otpService: OtpServicePort
    ){}

    async execute (email: string, otp: string): Promise<void> {

        await this.otpService.verifyOtp(email,otp, 'forgot-password',);
    }
}
```

---
## File: server-only\src\application\auth\VerifySignupOtpUseCase.ts
```ts
import { inject, injectable } from "inversify";
import { OtpServicePort } from "../ports/OtpServicePort";
import { TYPES } from "../../shared/di/types";

@injectable()
export class VerifySignupOtpUseCase {
  constructor(
    @inject(TYPES.OtpServicePort)
    private readonly otpService: OtpServicePort
  ) {}

  async execute(email: string, otp: string): Promise<void> {
    await this.otpService.verifyOtp(email, otp, "signup");
  }
}

```

---
## File: server-only\src\application\instructor\ApplyForInstructorUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { InstructorApplication } from '../../domain/entities/InstructorApplication';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/idGenerator';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';

interface ApplyForInstructorDTO {
  userId: string;
  bio: string;
  experienceYears: string;
  teachingExperience: 'yes' | 'no';
  courseIntent: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
}

@injectable()
export class ApplyForInstructorUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: ApplyForInstructorDTO) {
    // Check for existing application
    const existing = await this.applicationRepository.findByUserId(dto.userId);

    if (existing) {
      throw new AppError('You have already submitted an application', 400);
    }

    // Use entity's create factory method (validates business rules)
    let application: InstructorApplication;
    try {
      application = InstructorApplication.create(
        generateId(),  // Generate ID
        dto.userId,
        dto.bio,
        dto.experienceYears,
        dto.teachingExperience,
        dto.courseIntent,
        dto.level,
        dto.language
      );
    } catch (error: any) {
      if (error.name === 'DomainError') {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.applicationRepository.create(application);

    // UPDATE USER'S INSTRUCTOR STATE TO PENDING
    const user = await this.userRepository.findById(dto.userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.instructorState = 'pending';
    await this.userRepository.update(user);

    return { application };
  }
}
```

---
## File: server-only\src\application\instructor\ApproveInstructorApplicationUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { UserRole } from '../../domain/entities/UserRole';

@injectable()
export class ApproveInstructorApplicationUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(applicationId: string) {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Use entity's business logic
    try {
      application.approve();  // Throws DomainError if invalid
    } catch (error: any) {
      if (error.name === 'DomainError') {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    // Save updated application
    await this.applicationRepository.update(application);

    // Upgrade user role
    const user = await this.userRepository.findById(application.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.id) {
      throw new AppError('User ID not found', 500);
    }

    await this.userRepository.updateRole(user.id, UserRole.TUTOR);

    user.instructorState = 'approved';
    await this.userRepository.update(user);

    return {
      message: 'Application approved successfully',
      application,
    };
  }
}
```

---
## File: server-only\src\application\instructor\GetInstructorStatusUseCase.ts
```ts
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';

@injectable()
export class GetInstructorStatusUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
private readonly applicationRepository: InstructorApplicationRepositoryPort

  ) {}

  async execute(userId: string): Promise<string | null> {
    const application = await this.applicationRepository.findByUserId(userId);

    if (!application) {
      return null
    }

    return application.status;
  }
}

```

---
## File: server-only\src\application\instructor\ListInstructorApplicationsUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';

interface ListApplicationsQuery {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

@injectable()
export class ListInstructorApplicationsUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort
  ) {}

  async execute(query: ListApplicationsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }

    const applications = await this.applicationRepository.findAll(
      filter,
      skip,
      limit
    );

    const total = await this.applicationRepository.count(filter);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

---
## File: server-only\src\application\instructor\RejectInstructorApplicationUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';

@injectable()
export class RejectInstructorApplicationUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserReaderPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(applicationId: string, reason?: string) {
  const application = await this.applicationRepository.findById(applicationId);

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (!reason || reason.trim().length === 0) {
    throw new AppError('Rejection reason is required', 400);
  }

  // Use entity's business logic
  try {
    application.reject(reason);  // Throws DomainError if invalid
  } catch (error: any) {
    if (error.name === 'DomainError') {
      throw new AppError(error.message, 400);
    }
    throw error;
  }

  await this.applicationRepository.update(application);

  // Update users's instructor state to rejected
  const user = await this.userRepository.findById(application.userId);

  if(user) {
    user.instructorState = 'rejected';
    await this.userRepository.update(user);
  }

  return {
    message: 'Application rejected',
    application,
  };
}
}
```

---
## File: server-only\src\application\ports\InstructorApplicationRepositoryPort.ts
```ts
import { InstructorApplication } from '../../domain/entities/InstructorApplication';

export interface InstructorApplicationRepositoryPort {
  create(application: InstructorApplication): Promise<void>;
  findById(id: string): Promise<InstructorApplication | null>;
  findByUserId(userId: string): Promise<InstructorApplication | null>;
  findAll(filter: any, skip: number, limit: number): Promise<InstructorApplication[]>;  // ← ADD
  count(filter: any): Promise<number>;  // ← ADD
  update(application: InstructorApplication): Promise<void>;
}
```

---
## File: server-only\src\application\ports\OtpServicePort.ts
```ts
export type OtpPurpose = 'signup' | 'forgot-password';

export interface OtpServicePort {
  requestOtp(email: string, purpose: OtpPurpose): Promise<Date>;
  verifyOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void>;
}

```

---
## File: server-only\src\application\ports\PasswordHasherPort.ts
```ts
export interface PasswordHasherPort {
    hash(password: string): Promise <string>;
    compare(plain: string, hash: string): Promise<boolean>;
}
```

---
## File: server-only\src\application\ports\RefreshTokenRepositoryPort.ts
```ts
import { RefreshToken } from '../../domain/entities/RefreshToken';

export interface RefreshTokenRepositoryPort {
  create(refreshToken: RefreshToken): Promise<void>;
  findByHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(tokenHash: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  // deleteByTokenHash(tokenHash: string): Promise<void>;
} 
```

---
## File: server-only\src\application\ports\StorageServicePort.ts
```ts
export interface StorageServicePort {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}
```

---
## File: server-only\src\application\ports\TokenServicePort.ts
```ts
export interface TokenPayload {
    userId: string; 
    role: number;
}

export interface TokenServicePort {
    generateAccessToken(payload: TokenPayload): string;
    verifyAccessToken(toke: string): TokenPayload;
    generateRefreshToken(): string;
    hashToken(token: string): string;
}
```

---
## File: server-only\src\application\ports\UserReaderPort.ts
```ts
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';

export interface UserReaderPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}
```

---
## File: server-only\src\application\ports\UserRepositoryPort.ts
```ts
import { UserReaderPort } from './UserReaderPort';
import { UserWriterPort } from './UserWriterPort';

// Composite interface for backward compatibility
export interface UserRepositoryPort extends UserReaderPort, UserWriterPort {}
```

---
## File: server-only\src\application\ports\UserWriterPort.ts
```ts
import { User } from '../../domain/entities/User';

export interface UserWriterPort {
  create(user: User): Promise<User>;
  update(user: User): Promise<void>;
  updateRole(userId: string, role: number): Promise<void>;
}
```

---
## File: server-only\src\application\profile\DeleteAvatarUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { AppError } from '../../shared/errors/AppError';

@injectable()
export class DeleteAvatarUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.avatar) {
      throw new AppError('No avatar to delete', 400);
    }

    // Delete from cloud storage
    await this.storageService.deleteFile(user.avatar);

    // Update user entity
    user.updateAvatar(null);

    await this.userRepository.update(user);

    return { message: 'Avatar deleted successfully' };
  }
}
```

---
## File: server-only\src\application\profile\GetProfileUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { AppError } from '../../shared/errors/AppError';
import { UserReaderPort } from '../ports/UserReaderPort';

@injectable()
export class GetProfileUseCase {
  constructor(
    @inject(TYPES.UserReaderPort)  // Only inject what's needed
    private readonly userReader: UserReaderPort
  ) {}

  async execute(userId: string) {
    const user = await this.userReader.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatar,
      bio: user.bio,
      role: user.role,
    };
  }
}
```

---
## File: server-only\src\application\profile\UpdateProfileUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';

interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)  //  Needs both read and write
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(userId: string, data: UpdateProfileDTO) {
    const user = await this.userRepository.findById(userId);  // Read

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Use the updateProfile method from User entity
    user.updateProfile(data.firstName, data.lastName, data.bio);
    await this.userRepository.update(user);  // Write

    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatar,
      bio: user.bio,
    };
  }
}
```

---
## File: server-only\src\application\profile\UploadAvatarUseCase.ts
```ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { AppError } from '../../shared/errors/AppError';

@injectable()
export class UploadAvatarUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort
  ) {}

  async execute(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        await this.storageService.deleteFile(user.avatar);
      } catch (err) {
        // Ignore deletion errors
        console.error('Failed to delete old avatarUrl:', err);
      }
    }

    // Upload new avatar
    const avatarUrl = await this.storageService.uploadFile(file, 'avatars');

    // Use the updateAvatar method from User entity
    user.updateAvatar(avatarUrl);

    await this.userRepository.update(user);

    return {
      avatarUrl,
    };
  }
}
```

---
## File: server-only\src\bootstrap.ts
```ts
import 'reflect-metadata';
import './server';
```

---
## File: server-only\src\domain\auth\RefreshToken.ts
```ts
export interface RefreshToken {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
}
```

---
## File: server-only\src\domain\auth\RefreshTokenRepository.ts
```ts
// import { RefreshToken } from './RefreshToken';

// export interface RefreshTokenRepository {
//   create(token: RefreshToken): Promise<void>;
// }

```

---
## File: server-only\src\domain\entities\InstructorApplication.ts
```ts
import { DomainError } from "../errors/DomainError";

export class InstructorApplication {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bio: string,
    public readonly experienceYears: string,
    public readonly teachingExperience: 'yes' | 'no',
    public readonly courseIntent: string,
    public readonly level: 'beginner' | 'intermediate' | 'advanced',
    public readonly language: string,
    private _status: 'pending' | 'approved' | 'rejected',
    private _rejectionReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateBio(bio);
    this.validateCourseIntent(courseIntent);
  }

  //  Factory method for creation
  public static create(
    id: string,
    userId: string,
    bio: string,
    experienceYears: string,
    teachingExperience: 'yes' | 'no',
    courseIntent: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    language: string
  ): InstructorApplication {
    return new InstructorApplication(
      id,
      userId,
      bio,
      experienceYears,
      teachingExperience,
      courseIntent,
      level,
      language,
      'pending',  // Always starts as pending
      null,
      new Date(),
      new Date()
    );
  }

  // Factory method for reconstruction (from DB)
  public static reconstruct(
    id: string,
    userId: string,
    bio: string,
    experienceYears: string,
    teachingExperience: 'yes' | 'no',
    courseIntent: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    language: string,
    status: 'pending' | 'approved' | 'rejected',
    rejectionReason: string | null,
    createdAt: Date,
    updatedAt: Date
  ): InstructorApplication {
    return new InstructorApplication(
      id,
      userId,
      bio,
      experienceYears,
      teachingExperience,
      courseIntent,
      level,
      language,
      status,
      rejectionReason,
      createdAt,
      updatedAt
    );
  }

  // Business validation
  private validateBio(bio: string): void {
    if (bio.length < 50) {
      throw new DomainError('Bio must be at least 50 characters');
    }
    if (bio.length > 1000) {
      throw new DomainError('Bio must not exceed 1000 characters');
    }
  }

  private validateCourseIntent(courseIntent: string): void {
    if (courseIntent.length < 20) {
      throw new DomainError('Course intent must be at least 20 characters');
    }
    if (courseIntent.length > 500) {
      throw new DomainError('Course intent must not exceed 500 characters');
    }
  }

  // Business behavior: Approve
  public approve(): void {
    if (this._status === 'approved') {
      throw new DomainError('Application is already approved');
    }
    if (this._status === 'rejected') {
      throw new DomainError('Cannot approve a rejected application');
    }
    this._status = 'approved';
    this._rejectionReason = null;
  }

  // Business behavior: Reject
  public reject(reason: string): void {
    if (!reason || reason.trim().length === 0) {
      throw new DomainError('Rejection reason is required');
    }
    if (this._status === 'rejected') {
      throw new DomainError('Application is already rejected');
    }
    if (this._status === 'approved') {
      throw new DomainError('Cannot reject an approved application');
    }
    this._status = 'rejected';
    this._rejectionReason = reason;
  }

  // Business query: Can be approved?
  public canBeApproved(): boolean {
    return this._status === 'pending';
  }

  // Business query: Is approved?
  public isApproved(): boolean {
    return this._status === 'approved';
  }

  // Business query: Is pending?
  public isPending(): boolean {
    return this._status === 'pending';
  }

  // Getters (encapsulation)
  public get status(): string {
    return this._status;
  }

  public get rejectionReason(): string | null {
    return this._rejectionReason;
  }
}
```

---
## File: server-only\src\domain\entities\RefreshToken.ts
```ts
export class RefreshToken {
  constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date
  ) {}
}
```

---
## File: server-only\src\domain\entities\User.ts
```ts
import { DomainError } from "../errors/DomainError";
import { Email } from "../value-objects/Email";
import { UserRole } from "./UserRole";

export class User {
  constructor(
    public readonly email: Email,
    public readonly role: UserRole,
    public  passwordHash: string,
    public readonly isActive: boolean = true,
    public readonly emailVerified: boolean = false,
    public readonly id?: string, // assigned by repository

    public firstName?:string | null,
    public lastName?: string | null,
    public bio?: string | null,
    public avatar?: string | null,
    
    public instructorState?: 'not_applied' | 'pending' | 'approved' | 'rejected' | null
  ) {}

   // Business behavior: Can apply as instructor?
  public canApplyAsInstructor(): boolean {
    return this.role === UserRole.STUDENT && this.isActive && this.emailVerified;
  }

  // Business behavior: Upgrade to instructor
  public upgradeToInstructor(): void {
    if (this.role !== UserRole.STUDENT) {
      throw new DomainError('Only students can be upgraded to instructors');
    }
    if (!this.isActive) {
      throw new DomainError('Inactive users cannot become instructors');
    }
    if (!this.emailVerified) {
      throw new DomainError('Email must be verified to become an instructor');
    }
    // Note: Role is readonly, so we need a different approach
    // We'll handle this in the use case with repository.updateRole()
  }

  // Business behavior: Change password
  public changePassword(hashedPassword: string): void {
    if (!hashedPassword || hashedPassword.trim().length === 0) {
      throw new DomainError('Hashed password cannot be empty');
    }
    this.passwordHash = hashedPassword;
  }

  public getPassword(): string {
    return this.passwordHash;
  }

  public updateProfile (
    firstName?:string,
    lastName?:string,
    bio?:string,
  ):void {
    if (firstName !== undefined) {
      this.validateName(firstName);
      this.firstName = firstName;
    }
    if (lastName !== undefined) {
      this.validateName(lastName);
      this.lastName = lastName;
    }
    if (bio !== undefined) {
      this.validateBio(bio);
      this.bio = bio;
    }
  }
  
  private validateName(name: string): void {
    if (name.trim().length === 0) {
      throw new DomainError('Name cannot be empty');
    }
    if (name.length > 100) {
      throw new DomainError('Name cannot exceed 100 characters');
    }
  }

  private validateBio(bio: string): void {
    if (bio.length > 500) {
      throw new DomainError('Bio cannot exceed 500 characters');
    }
  }

  // Business validation: Avatar
  public updateAvatar(avatarUrl: string | null): void {
    if (avatarUrl !== null && !this.isValidUrl(avatarUrl)) {
      throw new DomainError('Invalid avatar URL');
    }
    this.avatar = avatarUrl;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

```

---
## File: server-only\src\domain\entities\UserRole.ts
```ts
export enum UserRole {
    STUDENT = 0,
    TUTOR = 1,
    ADMIN = 2,
}
```

---
## File: server-only\src\domain\errors\DomainError.ts
```ts
export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainError';
    }
}
```

---
## File: server-only\src\domain\instructor\InstructorApplicationRepository.ts
```ts
import { InstructorApplication } from "../entities/InstructorApplication";

export interface InstructorApplicationRepository {
  findByUserId(userId: string): Promise<InstructorApplication | null>;
  create(application: InstructorApplication): Promise<void>;
}

```

---
## File: server-only\src\domain\value-objects\Email.ts
```ts
export class Email {
    private readonly value: string;
    
    constructor (email: string) {
        if(!Email.isValid(email)) {
            throw new Error('Invalid email address');
        }
        this.value = email.toLowerCase();
    }
    getValue(): string{
        return this.value;
    }
    private static isValid(email: string): boolean{
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
```

---
## File: server-only\src\domain\value-objects\Password.ts
```ts
export class Password {
    private readonly value: string;
    constructor (password: string) {
        if(!Password.isValid(password)) {
            throw new Error('Password must be at leas 8 characters long');
        }
        this.value = password;
    }

    getValue(): string{
        return this.value;
    }
    private static isValid(password: string): boolean{
        return password.length >= 8;
    }
}
```

---
## File: server-only\src\infrastructure\database\models\InstructorApplicationModel.ts
```ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IInstructorApplicationDocument extends Document {
  userId: Types.ObjectId;
  bio: string;
  experienceYears: string;
  teachingExperience: 'yes' | 'no';
  courseIntent: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const instructorApplicationSchema = new Schema<IInstructorApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String, required: true },
    experienceYears: { type: String, required: true },
    teachingExperience: { 
      type: String, 
      enum: ['yes', 'no'], 
      required: true 
    },
    courseIntent: { type: String, required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: null },  // ← ADD
  },
  { timestamps: true }
);

instructorApplicationSchema.index({ status: 1, createdAt: -1 });

export const InstructorApplicationModel = model<IInstructorApplicationDocument>(
  'InstructorApplication',
  instructorApplicationSchema
);
```

---
## File: server-only\src\infrastructure\database\models\RefreshTokenModel.ts
```ts
import { Schema, model } from 'mongoose';

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const RefreshTokenModel = model(
  'RefreshToken',
  refreshTokenSchema
);

```

---
## File: server-only\src\infrastructure\database\models\user.model.ts
```ts
import { Schema, model, Document } from 'mongoose';

// ← ADD THIS INTERFACE
export interface IUserDocument extends Document {
  _id: any;
  email: string;
  passwordHash: string;
  role: number;
  isActive: boolean;
  emailVerified: boolean;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
  instructorState: 'not_applied' | 'pending' | 'approved' | 'rejected';
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: Number, enum: [0, 1, 2], required: true,
   default: 0 },
   instructorState: {
      type: String,
      enum: ['not_applied', 'pending', 'approved', 'rejected'],
      default: 'not_applied'
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    avatar: { type: String, default: null },
    bio: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserModel = model<IUserDocument>('User', userSchema);
```

---
## File: server-only\src\infrastructure\database\mongoose.connection.ts
```ts
import mongoose from 'mongoose';
import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';
import './models/user.model';


/**
 * Register MongoDB lifecycle events (call once)
 */
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established (event)');
});

mongoose.connection.on('disconnected', () => {
  logger.info('MongoDB connection closed (event)');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error (event)', error);
});

export async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnect initiated');
  } catch (error) {
    logger.error('Error while disconnecting MongoDB', error);
  }
}

```

---
## File: server-only\src\infrastructure\database\repositories\MongoInstructorApplicationRepository.ts
```ts
import { injectable } from 'inversify';
import { InstructorApplicationRepositoryPort } from '../../../application/ports/InstructorApplicationRepositoryPort';
import { InstructorApplication } from '../../../domain/entities/InstructorApplication';
import { 
  InstructorApplicationModel,
  IInstructorApplicationDocument 
} from '../models/InstructorApplicationModel';
import { Types } from 'mongoose';

@injectable()
export class MongoInstructorApplicationRepository
  implements InstructorApplicationRepositoryPort
{
  async findByUserId(userId: string): Promise<InstructorApplication | null> {
  const doc = await InstructorApplicationModel.findOne({
    userId: new Types.ObjectId(userId),
  });

  if (!doc) return null;
  return this.toDomain(doc);
}

  async findById(id: string): Promise<InstructorApplication | null> {
    const doc = await InstructorApplicationModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(
    filter: any,
    skip: number,
    limit: number
  ): Promise<InstructorApplication[]> {
    const docs = await InstructorApplicationModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  async count(filter: any): Promise<number> {
    return await InstructorApplicationModel.countDocuments(filter);
  }

  async create(application: InstructorApplication): Promise<void> {
    await InstructorApplicationModel.create(this.toPersistence(application));
  }

  async update(application: InstructorApplication): Promise<void> {
    await InstructorApplicationModel.updateOne(
      { _id: application.id },
      { $set: this.toPersistence(application) }
    );
  }

  // ← FIX THIS METHOD
  private toDomain(doc: IInstructorApplicationDocument): InstructorApplication {
  // Use entity's reconstruct factory method
  return InstructorApplication.reconstruct(
    doc._id.toString(),
    doc.userId.toString(),
    doc.bio,
    doc.experienceYears,
    doc.teachingExperience,
    doc.courseIntent,
    doc.level,
    doc.language,
    doc.status,
    doc.rejectionReason || null,
    doc.createdAt,
    doc.updatedAt
  );
}

private toPersistence(
  app: InstructorApplication
): Partial<IInstructorApplicationDocument> {
  return {
    userId: app.userId as any,
    bio: app.bio,
    experienceYears: app.experienceYears,
    teachingExperience: app.teachingExperience,
    courseIntent: app.courseIntent,
    level: app.level,
    language: app.language,
    status: app.status as any,
    rejectionReason: app.rejectionReason,
    updatedAt: new Date(),
  };
}
}
```

---
## File: server-only\src\infrastructure\database\repositories\MongoRefreshTokenRepository.ts
```ts
import { injectable } from "inversify";
// import { RefreshToken } from "../../../domain/auth/RefreshToken";
import { RefreshTokenModel } from "../models/RefreshTokenModel";
import { AppError } from "../../../shared/errors/AppError";
import { RefreshTokenRepositoryPort } from "../../../application/ports/RefreshTokenRepositoryPort";
import { RefreshToken } from "../../../domain/entities/RefreshToken";

@injectable()
export class MongoRefreshTokenRepository implements RefreshTokenRepositoryPort {
    async create (token: RefreshToken): Promise <void> {
        try {
            await RefreshTokenModel.create({
                userId: token.userId,
                tokenHash: token.tokenHash,
                expiresAt: token.expiresAt,
            });
        } catch (error) {
            throw new AppError('Failed to create refresh token', 500);
        }
    }

    async findByHash(tokenHash: string): Promise<RefreshToken | null> {
        try {
            const doc = await RefreshTokenModel.findOne({ tokenHash }).lean();

            if(!doc) {
                return null;
            }

            return new RefreshToken(
                doc._id.toString(),
                doc?.userId.toString(),
                doc?.tokenHash,
                doc?.expiresAt,
                doc?.createdAt,
            )
        } catch {
            throw new AppError('Failed to find refresh token', 500);
        }
    }

    async revoke(tokenHash: string): Promise<void> {
        try {
            await RefreshTokenModel.deleteOne({tokenHash});
        } catch (error) {
            throw new AppError('Failed to revoke refresh token', 500);
        }
    }
    async revokeAllForUser(userId: string): Promise<void> {
        try {
            await RefreshTokenModel.deleteMany({userId});
        } catch (error) {
            throw new AppError('Failed to revoke refresh token for users', 500);
        }
    }
}
```

---
## File: server-only\src\infrastructure\database\repositories\MongoUserRepository.ts
```ts
import { injectable } from 'inversify';
import { UserRepositoryPort } from '../../../application/ports/UserRepositoryPort';
import { User } from '../../../domain/entities/User';
import { UserRole } from '../../../domain/entities/UserRole';
import { Email } from '../../../domain/value-objects/Email';
import { UserModel, IUserDocument } from '../models/user.model';

@injectable()
export class MongoUserRepository implements UserRepositoryPort {
  
  async findByEmail(email: Email): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.getValue() });
    if (!doc) return null;
    return this.toDomain(doc);  // Use helper
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create(this.toPersistence(user));  // Use helper
    return this.toDomain(doc);  // Use helper
  }

  async update(user: User): Promise<void> {
    const result = await UserModel.updateOne(
      { _id: user.id },
      { $set: this.toPersistence(user) }  // Use helper
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found during update');
    }
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);  // Use helper
  }

  async updateRole(userId: string, role: number): Promise<void> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: { role, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }
  }

  // HELPER: Convert DB document to Domain entity
  private toDomain(doc: IUserDocument): User {
    return new User(
      new Email(doc.email),
      doc.role as UserRole,
      doc.passwordHash,
      doc.isActive,
      doc.emailVerified,
      doc._id.toString(),
      doc.firstName || null,
      doc.lastName || null,
      doc.bio || null,
      doc.avatar || null,
      doc.instructorState || 'not_applied'
    );
  }

  // HELPER: Convert Domain entity to DB document
  private toPersistence(user: User): Partial<IUserDocument> {
    return {
      email: user.email.getValue(),
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      instructorState: user.instructorState ?? 'not_applied',
      updatedAt: new Date(),
    };
  }
}
```

---
## File: server-only\src\infrastructure\di\container.ts
```ts
import 'reflect-metadata';

// import { AuthController } from '../../presentation/controllers/auth.controller';
import { InstructorController } from '../../presentation/controllers/InstructorController';

import { Container } from 'inversify';

import { TYPES } from '../../shared/di/types';

// Repositories
import { MongoUserRepository } from '../database/repositories/MongoUserRepository';
import { MongoRefreshTokenRepository } from '../database/repositories/MongoRefreshTokenRepository';
import { MongoInstructorApplicationRepository } from '../database/repositories/MongoInstructorApplicationRepository';

// Services
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { JwtTokenService } from '../security/JwtTokenService';
import { RedisOtpService } from '../services/RedisOtpService';

// Use cases (Auth)
import { LoginUserUseCase } from '../../application/auth/LoginUserUseCase';
import { RegisterUserUseCase } from '../../application/auth/RegisterUserUseCase';
import { ResetPasswordUseCase } from '../../application/auth/ResetPasswordUseCase';
import { GetCurrentUserUseCase } from '../../application/auth/GetCurrentUserUseCase';

import { RequestSignupOtpUseCase } from '../../application/auth/RequestSignupOtpUseCase';
import { VerifySignupOtpUseCase } from '../../application/auth/VerifySignupOtpUseCase';
import { RequestPasswordResetOtpUseCase } from '../../application/auth/RequestPasswordResetOtpUseCase';
import { VerifyPasswordResetOtpUseCase } from '../../application/auth/VerifyPasswordResetOtpUseCase';

import { CreateRefreshTokenUseCase } from '../../application/auth/CreateRefreshTokenUseCase';
import { RefreshAccessTokenUseCase } from '../../application/auth/RefreshAccessTokenUseCase';

// Use cases (Instructor)
import { ApplyForInstructorUseCase } from '../../application/instructor/ApplyForInstructorUseCase';
import { GetInstructorStatusUseCase } from '../../application/instructor/GetInstructorStatusUseCase';
import { GetProfileUseCase } from '../../application/profile/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../application/profile/UpdateProfileUseCase';
import { UploadAvatarUseCase } from '../../application/profile/UploadAvatarUseCase';
import { DeleteAvatarUseCase } from '../../application/profile/DeleteAvatarUseCase';
import { ProfileController } from '../../presentation/controllers/ProfileController';
import { S3StorageService } from '../storage/s3.storage';

import { RejectInstructorApplicationUseCase } from '../../application/instructor/RejectInstructorApplicationUseCase';
import { ApproveInstructorApplicationUseCase } from '../../application/instructor/ApproveInstructorApplicationUseCase';
import { ListInstructorApplicationsUseCase } from '../../application/instructor/ListInstructorApplicationsUseCase';
import { LoginController } from '../../presentation/controllers/LoginController';
import { SignupController } from '../../presentation/controllers/SignupController';
import { PasswordResetController } from '../../presentation/controllers/PasswordResetController';
import { RevokeRefreshTokenUseCase } from '../../application/auth/RevokeRefreshTokenUseCase';
import { LogoutUserUseCase } from '../../application/auth/LogoutUserUseCase';
import { SignupUseCase } from '../../application/auth/SignupUseCase';
// import { JwtAuthMiddleware } from '../security/jwt-auth.middleware';

export const container = new Container();

/* -----------------------------
   Repository bindings
----------------------------- */

container
  .bind(TYPES.UserRepositoryPort)
  .to(MongoUserRepository);

container
  .bind(TYPES.RefreshTokenRepositoryPort)
  .to(MongoRefreshTokenRepository);

container
  .bind(TYPES.InstructorApplicationRepositoryPort)  
  .to(MongoInstructorApplicationRepository);
/* -----------------------------
   Service bindings
----------------------------- */

container
  .bind(TYPES.PasswordHasherPort)
  .to(BcryptPasswordHasher);

container
  .bind(TYPES.TokenServicePort)
  .to(JwtTokenService);

container
  .bind(TYPES.OtpServicePort)
  .to(RedisOtpService);

/* -----------------------------
   Use case bindings
----------------------------- */

container
  .bind(TYPES.LoginUserUseCase)
  .to(LoginUserUseCase);

container
  .bind(TYPES.RegisterUserUseCase)
  .to(RegisterUserUseCase);

container
  .bind(TYPES.ResetPasswordUseCase)
  .to(ResetPasswordUseCase);

container
  .bind(TYPES.GetCurrentUserUseCase)
  .to(GetCurrentUserUseCase);

container
  .bind(TYPES.RequestSignupOtpUseCase)
  .to(RequestSignupOtpUseCase);

container
  .bind(TYPES.VerifySignupOtpUseCase)
  .to(VerifySignupOtpUseCase);

container
  .bind(TYPES.RequestPasswordResetOtpUseCase)
  .to(RequestPasswordResetOtpUseCase);

container
  .bind(TYPES.VerifyPasswordResetOtpUseCase)
  .to(VerifyPasswordResetOtpUseCase);

container
  .bind(TYPES.CreateRefreshTokenUseCase)
  .to(CreateRefreshTokenUseCase);

container
  .bind(TYPES.RefreshAccessTokenUseCase)
  .to(RefreshAccessTokenUseCase);

container
  .bind(TYPES.RevokeRefreshTokenUseCase)
  .to(RevokeRefreshTokenUseCase);

/* -----------------------------
   Instructor use cases
----------------------------- */

container
  .bind(TYPES.ApplyForInstructorUseCase)
  .to(ApplyForInstructorUseCase);

container
  .bind(TYPES.GetInstructorStatusUseCase)
  .to(GetInstructorStatusUseCase);

  /* -----------------------------
            Middleware
----------------------------- */

//   container.bind<JwtAuthMiddleware>(
//     TYPES.JwtAuthMiddleware
//   ).to(JwtAuthMiddleware);
/* -----------------------------
   Controller bindings
----------------------------- */

// container
//   .bind(TYPES.AuthController)
//   .to(AuthController);

container
  .bind(TYPES.InstructorController)
  .to(InstructorController);


// Use cases
container.bind(TYPES.GetProfileUseCase).to(GetProfileUseCase);
container.bind(TYPES.UpdateProfileUseCase).to(UpdateProfileUseCase);
container.bind(TYPES.UploadAvatarUseCase).to(UploadAvatarUseCase);
container.bind(TYPES.DeleteAvatarUseCase).to(DeleteAvatarUseCase);

container.bind(TYPES.ListInstructorApplicationsUseCase).to(ListInstructorApplicationsUseCase);
container.bind(TYPES.ApproveInstructorApplicationUseCase).to(ApproveInstructorApplicationUseCase);
container.bind(TYPES.RejectInstructorApplicationUseCase).to(RejectInstructorApplicationUseCase);

// Controller
container.bind(TYPES.ProfileController).to(ProfileController);

// Storage service
container.bind(TYPES.StorageServicePort).to(S3StorageService);


// Add new controller bindings
container.bind(TYPES.LoginController).to(LoginController);
container.bind(TYPES.SignupController).to(SignupController);
container.bind(TYPES.PasswordResetController).to(PasswordResetController);

// Bind to same implementation (backward compatible)
container.bind(TYPES.UserReaderPort).to(MongoUserRepository);
container.bind(TYPES.UserWriterPort).to(MongoUserRepository);
// container.bind(TYPES.UserRepositoryPort).to(MongoUserRepository);
container
  .bind(TYPES.LogoutUserUseCase)
  .to(LogoutUserUseCase);


  container.bind(TYPES.SignupUseCase).to(SignupUseCase);
```

---
## File: server-only\src\infrastructure\http\AuthenticatedRequest.ts
```ts
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

```

---
## File: server-only\src\infrastructure\http\express.ts
```ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from '../../presentation/routes/auth.routes'
import instructorRoutes  from '../../presentation/routes/instructor.routes';
import apiRoutes from '../../presentation/routes';
import profileRoutes from "../../presentation/routes/profile.routes"

import { globalErrorHandler } from '../../presentation/middlewares/error.middleware';

export function createExpressApp() {
  const app = express();

  app.use(cors({
    origin: 'http://localhost:5173',
    credentials
    :true,
  }));
  

  app.use(express.json());
  app.use(cookieParser());

  app.use('/api', apiRoutes);
  app.use('/auth', authRoutes)
  app.use(
  '/instructor',
  instructorRoutes
);
app.use('/profile', profileRoutes)


  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      message: 'Route not found',
      path: req.originalUrl,
    });
  });

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
}

```

---
## File: server-only\src\infrastructure\middlewares\upload.middleware.ts
```ts
import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { storageConfig } from '../../shared/config/storage.config';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (storageConfig.limits.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
        400
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: storageConfig.limits.maxFileSize,
  },
});
```

---
## File: server-only\src\infrastructure\redis\redis.client.ts
```ts
import { createClient } from "redis";
import { logger } from "../../shared/utils/logger";
import { env } from "../../shared/config/env";

export const redisClient = createClient({
  username: 'default',
  password: env.redisPassword,
  socket: {
    host: env.redisHost,
    port: env.redisPort,
  },
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.error("[ERROR]Redis error", err);
});

export async function initRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

```

---
## File: server-only\src\infrastructure\security\admin-auth.middleware.ts
```ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './jwt-auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    throw new AppError('Authentication required', 401);
  }

  // Check if user has admin role (assuming 2 = admin)
  if (authReq.user.role !== 2) {
    throw new AppError('Admin access required', 403);
  }

  next();
}
```

---
## File: server-only\src\infrastructure\security\BcryptPasswordHasher.ts
```ts
import { injectable } from "inversify";
import bcrypt from 'bcrypt';

import { PasswordHasherPort } from "../../application/ports/PasswordHasherPort";

@injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
    async hash(password: string): Promise<string>{
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}
```

---
## File: server-only\src\infrastructure\security\jwt-auth.middleware.ts
```ts
import { NextFunction, Request, Response } from "express";
import { container } from '../di/container';
import { TYPES } from '../../shared/di/types';
import { TokenServicePort } from '../../application/ports/TokenServicePort';
import { UserRole } from "../../domain/entities/UserRole";

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: UserRole;
    };
}

// Keep as function - resolve from container when needed
export function jwtAuthMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization token missing or invalid',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Get token service from container
        const tokenService = container.get<TokenServicePort>(TYPES.TokenServicePort);
        const payload = tokenService.verifyAccessToken(token);

        req.user = {
            userId: payload.userId,
            role: payload.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token',
        });
    }
}
```

---
## File: server-only\src\infrastructure\security\JwtTokenService.ts
```ts
import { injectable } from "inversify";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { TokenPayload, TokenServicePort } from "../../application/ports/TokenServicePort";
import { env } from "../../shared/config/env";
import { AppError } from "../../shared/errors/AppError";

@injectable()
export class JwtTokenService implements TokenServicePort {
  generateAccessToken (payload: TokenPayload): string{
    const secret = env.jwtSecret

    if(!secret) {
      throw new AppError('JWT access secret not configured', 500);
    }

    return jwt.sign(payload,secret,{
      expiresIn:env.jwtExpiresIn
    });
  }

  verifyAccessToken(token: string): TokenPayload {
      const secret = env.jwtSecret;

      if(!secret) {
        throw new AppError('JWT access secret not configure', 500);
      }

      try {
        return jwt.verify(token, secret) as TokenPayload;
      } catch  {
        throw new AppError('Invalid or expired access token', 401);
      }
  }

  generateRefreshToken(): string {
      return crypto.randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
      return crypto.createHash('sha256').update(token).digest('hex');
  }
}
```

---
## File: server-only\src\infrastructure\services\RedisOtpService.ts
```ts


import { injectable } from 'inversify';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import { redisClient } from '../redis/redis.client';
import { AppError } from '../../shared/errors/AppError';
import { OtpServicePort } from '../../application/ports/OtpServicePort';
import { env } from "../../shared/config/env";

/* -----------------------------
   Types
----------------------------- */

type OtpPurpose = 'signup' | 'forgot-password';

interface CachedOtp {
  hash: string;
  attempts: number;
}

/* -----------------------------
   Constants
----------------------------- */

const OTP_TTL_SECONDS = 120;
const MAX_ATTEMPTS = 5;

/* -----------------------------
   Service
----------------------------- */

@injectable()
export class RedisOtpService implements OtpServicePort {
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  private key(email: string, purpose: OtpPurpose): string {
    return `otp:${purpose}:${email.toLowerCase()}`;
  }

  async requestOtp(email: string, purpose: OtpPurpose): Promise<Date> {
    const otp = this.generateOtp();
    

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.deepLearnEmail,
        pass: env.deepLearnPassword,
      },
    });

    try {
      await transporter.sendMail({
        from: env.deepLearnEmail,
        to: email,
        subject: 'Your OTP Code',
        html: `
          <p>Your OTP is:</p>
          <h2>${otp}</h2>
          <p>This OTP expires in 2 minutes.</p>
        `,
      });
    } catch {
      throw new AppError('Failed to send OTP email', 500);
    }

    try {
      await redisClient.set(
        this.key(email, purpose),
        JSON.stringify({
          hash: this.hashOtp(otp),
          attempts: 0,
        }),
        { EX: OTP_TTL_SECONDS }
      );
    } catch {
      throw new AppError('Failed to store OTP', 500);
    }

    return new Date(Date.now() + OTP_TTL_SECONDS * 1000);
  }

  async verifyOtp(
    email: string,
    inputOtp: string,
    purpose: OtpPurpose
  ): Promise<void> {
    const redisKey = this.key(email, purpose);

    const raw = await redisClient.get(redisKey);
    if (!raw) {
      throw new AppError('OTP expired or invalid', 400);
    }

    const cached: CachedOtp = JSON.parse(raw);

    if (cached.attempts >= MAX_ATTEMPTS) {
      await redisClient.del(redisKey);
      throw new AppError('Too many invalid OTP attempts', 429);
    }

    if (this.hashOtp(inputOtp) !== cached.hash) {
      cached.attempts += 1;

      await redisClient.set(
        redisKey,
        JSON.stringify(cached),
        { EX: OTP_TTL_SECONDS }
      );

      throw new AppError('Invalid OTP', 400);
    }

    await redisClient.del(redisKey);
  }
}

```

---
## File: server-only\src\infrastructure\storage\s3.storage.ts
```ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { injectable } from 'inversify';
import { storageConfig } from '../../shared/config/storage.config';

@injectable()
export class S3StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: storageConfig.aws.region,
      credentials: {
        accessKeyId: storageConfig.aws.accessKeyId,
        secretAccessKey: storageConfig.aws.secretAccessKey,
      },
    });
    this.bucketName = storageConfig.aws.bucketName;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);

    return `https://${this.bucketName}.s3.${storageConfig.aws.region}.amazonaws.com/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('.com/')[1];

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    await this.s3Client.send(command);
  }

  async getSignedUploadUrl(fileName: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
```

---
## File: server-only\src\presentation\controllers\auth.controller.ts
```ts
// import { Request, Response } from "express";
// import { inject, injectable } from "inversify";

// import { TYPES } from "../../shared/di/types";

// import { LoginUserUseCase } from "../../application/auth/LoginUserUseCase";
// import { GetCurrentUserUseCase } from "../../application/auth/GetCurrentUserUseCase";
// import { RegisterUserUseCase } from "../../application/auth/RegisterUserUseCase";

// import { RequestSignupOtpUseCase } from "../../application/auth/RequestSignupOtpUseCase";
// import { VerifySignupOtpUseCase } from "../../application/auth/VerifySignupOtpUseCase";

// import { RequestPasswordResetOtpUseCase } from "../../application/auth/RequestPasswordResetOtpUseCase";
// import { VerifyPasswordResetOtpUseCase } from "../../application/auth/VerifyPasswordResetOtpUseCase";
// import { ResetPasswordUseCase } from "../../application/auth/ResetPasswordUseCase";

// import { CreateRefreshTokenUseCase } from "../../application/auth/CreateRefreshTokenUseCase";
// import { RefreshAccessTokenUseCase } from "../../application/auth/RefreshAccessTokenUseCase";
// import { RevokeRefreshTokenUseCase } from "../../application/auth/RevokeRefreshTokenUseCase";

// import { AuthenticatedRequest } from "../../infrastructure/security/jwt-auth.middleware";
// import { CookieHelper } from "../utils/cookie.helper";
// import { authConfig } from "../../shared/config/auth.config";

// @injectable()
// export class AuthController {
//   constructor(
//     @inject(TYPES.LoginUserUseCase)
//     private readonly loginUserUseCase: LoginUserUseCase,

//     @inject(TYPES.RegisterUserUseCase)
//     private readonly registerUserUseCase: RegisterUserUseCase,

//     @inject(TYPES.GetCurrentUserUseCase)
//     private readonly getCurrentUserUseCase: GetCurrentUserUseCase,

//     @inject(TYPES.RequestSignupOtpUseCase)
//     private readonly requestSignupOtpUseCase: RequestSignupOtpUseCase,

//     @inject(TYPES.VerifySignupOtpUseCase)
//     private readonly verifySignupOtpUseCase: VerifySignupOtpUseCase,

//     @inject(TYPES.RequestPasswordResetOtpUseCase)
//     private readonly requestPasswordResetOtpUseCase: RequestPasswordResetOtpUseCase,

//     @inject(TYPES.VerifyPasswordResetOtpUseCase)
//     private readonly verifyPasswordResetOtpUseCase: VerifyPasswordResetOtpUseCase,

//     @inject(TYPES.ResetPasswordUseCase)
//     private readonly resetPasswordUseCase: ResetPasswordUseCase,

//     @inject(TYPES.CreateRefreshTokenUseCase)
//     private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,

//     @inject(TYPES.RefreshAccessTokenUseCase)
//     private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,

//     @inject(TYPES.RevokeRefreshTokenUseCase)
//     private readonly revokeRefreshTokenUseCase: RevokeRefreshTokenUseCase
//   ) {}

//   /* ================= LOGIN ================= */

//   async login(req: Request, res: Response): Promise<Response> {
//     const { email, password } = req.body;

//     const { user, accessToken } =
//       await this.loginUserUseCase.execute({ email, password });

//     if (!user.id) {
//       throw new Error('User ID missing after login');
//     }

//     const { token: refreshToken } =
//       await this.createRefreshTokenUseCase.execute(user.id);

//     CookieHelper.setRefreshTokenCookie(
//       res,
//       refreshToken,
//       authConfig.refreshToken.expiresInMs
//     );

//     return res.status(200).json({
//       message: 'Login successful',
//       user,
//       accessToken,
//     });
//   }

//   /* ================= SIGNUP ================= */

//   async requestSignupOtp(req: Request, res: Response): Promise<Response> {
//     const { email } = req.body;

//     const expiresAt =
//       await this.requestSignupOtpUseCase.execute(email);

//     return res.status(200).json({
//       message: 'OTP sent successfully',
//       expiresAt,
//     });
//   }

//   async signup(req: Request, res: Response): Promise<Response> {
//     const { email, otp, password, firstName, lastName } = req.body;

//     await this.verifySignupOtpUseCase.execute(email, otp);

//     console.log(firstName, lastName)
//     const user = await this.registerUserUseCase.execute({
//       email,
//       password,
//       firstName,
//       lastName
//     });

//     if (!user.id) {
//       throw new Error('User ID missing');
//     }

//     // Generate access token via login use case
//     const { accessToken } = await this.loginUserUseCase.execute({
//       email,
//       password,
//     });

//     const { token: refreshToken } =
//       await this.createRefreshTokenUseCase.execute(user.id);

//     CookieHelper.setRefreshTokenCookie(
//       res,
//       refreshToken,
//       authConfig.refreshToken.expiresInMs
//     );

//     return res.status(201).json({
//       message: 'Signup successful',
//       user,
//       accessToken,
//     });
//   }

//   /* ================= PASSWORD RESET ================= */

//   async requestPasswordResetOtp(req: Request, res: Response): Promise<Response> {
//     const { email } = req.body;

//     await this.requestPasswordResetOtpUseCase.execute(email);

//     return res.status(200).json({
//       message: 'If the email exists, an OTP has been sent',
//     });
//   }

//   async verifyPasswordResetOtp(req: Request, res: Response): Promise<Response> {
//     const { email, otp } = req.body;

//     await this.verifyPasswordResetOtpUseCase.execute(email, otp);

//     return res.status(200).json({
//       message: 'OTP verified successfully',
//     });
//   }

//   async resetPassword(req: Request, res: Response): Promise<Response> {
//     const { email, password } = req.body;

//     await this.resetPasswordUseCase.execute(email, password);

//     return res.status(200).json({
//       message: 'Password reset successful',
//     });
//   }

//   /* ================= AUTH SESSION ================= */

//   async me(req: Request, res: Response): Promise<Response> {
//     const authReq = req as AuthenticatedRequest;

//     const user = await this.getCurrentUserUseCase.execute(
//       authReq.user!.userId
//     );

//     return res.status(200).json({ user });
//   }

//   async refresh(req: Request, res: Response): Promise<Response> {
//     const refreshToken = CookieHelper.getRefreshToken(req);

//     if (!refreshToken) {
//       return res.status(401).json({ message: 'Missing refresh token' });
//     }

//     const {
//       accessToken,
//       refreshToken: newRefreshToken,
//     } = await this.refreshAccessTokenUseCase.execute(refreshToken);

//     CookieHelper.setRefreshTokenCookie(
//       res,
//       newRefreshToken,
//       authConfig.refreshToken.expiresInMs
//     );

//     return res.status(200).json({ accessToken });
//   }

//   async logout(req: Request, res: Response): Promise<Response> {
//     const refreshToken = CookieHelper.getRefreshToken(req);

//     if (refreshToken) {
//       await this.revokeRefreshTokenUseCase.execute(refreshToken);
//     }

//     CookieHelper.clearRefreshTokenCookie(res);

//     return res.status(200).json({ message: 'Logged out' });
//   }
// }

```

---
## File: server-only\src\presentation\controllers\health.controller.ts
```ts
import { Request, Response } from 'express';

export class HealthController {
  static check(req: Request, res: Response) {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }
}

```

---
## File: server-only\src\presentation\controllers\InstructorController.ts
```ts
import { Request,Response } from 'express';
import { inject, injectable } from 'inversify';

import { TYPES } from '../../shared/di/types';

import { ApplyForInstructorUseCase } from '../../application/instructor/ApplyForInstructorUseCase';
import { GetInstructorStatusUseCase } from '../../application/instructor/GetInstructorStatusUseCase';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';

import { ListInstructorApplicationsUseCase } from '../../application/instructor/ListInstructorApplicationsUseCase';
import { ApproveInstructorApplicationUseCase } from '../../application/instructor/ApproveInstructorApplicationUseCase';
import { RejectInstructorApplicationUseCase } from '../../application/instructor/RejectInstructorApplicationUseCase';

@injectable()
export class InstructorController {
  constructor(
    @inject(TYPES.ApplyForInstructorUseCase)
    private readonly applyForInstructorUseCase: ApplyForInstructorUseCase,

    @inject(TYPES.GetInstructorStatusUseCase)
    private readonly getInstructorStatusUseCase: GetInstructorStatusUseCase,

     @inject(TYPES.ListInstructorApplicationsUseCase)
    private readonly listApplicationsUseCase: ListInstructorApplicationsUseCase,

    @inject(TYPES.ApproveInstructorApplicationUseCase)
    private readonly approveApplicationUseCase: ApproveInstructorApplicationUseCase,

    @inject(TYPES.RejectInstructorApplicationUseCase)
    private readonly rejectApplicationUseCase: RejectInstructorApplicationUseCase
  ) {}

    /* ================= APPLY ================= */

  async apply (req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const application = await this.applyForInstructorUseCase.execute({
      userId: authReq.user!.userId,
      ...req.body,
    });

    return res.status(201).json({
      message: 'Instructor application submitted',
      application,
    });
  }

    /* ================= STATUS ================= */
    

  async getStatus(req: Request, res: Response) : Promise <Response>{
  const authReq = req as AuthenticatedRequest;

  const status = await this.getInstructorStatusUseCase.execute(
    authReq.user!.userId
  );

  return res.status(200).json({
    status: status
  });
}

async listApplications(req: Request, res: Response): Promise<Response> {
    const { page, limit, status } = req.query;

    const result = await this.listApplicationsUseCase.execute({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as any,
    });

    return res.status(200).json(result);
  }

  /* ================= ADMIN: APPROVE APPLICATION ================= */

  async approveApplication(req: Request, res: Response): Promise<Response> {
    const { applicationId } = req.params;

    const result = await this.approveApplicationUseCase.execute(applicationId);

    return res.status(200).json(result);
  }

  /* ================= ADMIN: REJECT APPLICATION ================= */

  async rejectApplication(req: Request, res: Response): Promise<Response> {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const result = await this.rejectApplicationUseCase.execute(
      applicationId,
      reason
    );

    return res.status(200).json(result);
  }


}

```

---
## File: server-only\src\presentation\controllers\LoginController.ts
```ts
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { LoginUserUseCase } from '../../application/auth/LoginUserUseCase';
import { RefreshAccessTokenUseCase } from '../../application/auth/RefreshAccessTokenUseCase';
import { LogoutUserUseCase } from '../../application/auth/LogoutUserUseCase';
import { GetCurrentUserUseCase } from '../../application/auth/GetCurrentUserUseCase';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';

@injectable()
export class LoginController {
  constructor(
    @inject(TYPES.LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase,

    @inject(TYPES.GetCurrentUserUseCase)
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,

    @inject(TYPES.RefreshAccessTokenUseCase)
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,

    @inject(TYPES.LogoutUserUseCase)
    private readonly logoutUserUseCase: LogoutUserUseCase
  ) {}

  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const result = await this.loginUserUseCase.execute({ email, password });

    // Set refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  async getCurrentUser(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const user = await this.getCurrentUserUseCase.execute(authReq.user!.userId);

    return res.status(200).json({ user });
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const result = await this.refreshAccessTokenUseCase.execute(refreshToken);

    // Set new refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken: result.accessToken,
    });
  }

  async logout(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await this.logoutUserUseCase.execute(refreshToken);
    }

    res.clearCookie('refreshToken');

    return res.status(200).json({
      message: 'Logged out successfully',
    });
  }
}
```

---
## File: server-only\src\presentation\controllers\PasswordResetController.ts
```ts
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RequestPasswordResetOtpUseCase } from '../../application/auth/RequestPasswordResetOtpUseCase';
import { VerifyPasswordResetOtpUseCase } from '../../application/auth/VerifyPasswordResetOtpUseCase';
import { ResetPasswordUseCase } from '../../application/auth/ResetPasswordUseCase';

@injectable()
export class PasswordResetController {
  constructor(
    @inject(TYPES.RequestPasswordResetOtpUseCase)
    private readonly requestPasswordResetOtpUseCase: RequestPasswordResetOtpUseCase,

    @inject(TYPES.VerifyPasswordResetOtpUseCase)
    private readonly verifyPasswordResetOtpUseCase: VerifyPasswordResetOtpUseCase,

    @inject(TYPES.ResetPasswordUseCase)
    private readonly resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  async requestOtp(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    await this.requestPasswordResetOtpUseCase.execute(email);

    return res.status(200).json({
      message: 'If the email exists, a verification code has been sent',
    });
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const { email, otp } = req.body;

    await this.verifyPasswordResetOtpUseCase.execute(email, otp);

    return res.status(200).json({
      message: 'OTP verified successfully',
    });
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    await this.resetPasswordUseCase.execute(email, password);

    return res.status(200).json({
      message: 'Password reset successfully',
    });
  }
}
```

---
## File: server-only\src\presentation\controllers\ProfileController.ts
```ts
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { GetProfileUseCase } from '../../application/profile/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../application/profile/UpdateProfileUseCase';
import { UploadAvatarUseCase } from '../../application/profile/UploadAvatarUseCase';
import { DeleteAvatarUseCase } from '../../application/profile/DeleteAvatarUseCase';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.GetProfileUseCase)
    private readonly getProfileUseCase: GetProfileUseCase,

    @inject(TYPES.UpdateProfileUseCase)
    private readonly updateProfileUseCase: UpdateProfileUseCase,

    @inject(TYPES.UploadAvatarUseCase)
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,

    @inject(TYPES.DeleteAvatarUseCase)
    private readonly deleteAvatarUseCase: DeleteAvatarUseCase
  ) {}

  async getProfile(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const profile = await this.getProfileUseCase.execute(authReq.user!.userId);
    return res.status(200).json(profile);
  }

  async updateProfile(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const profile = await this.updateProfileUseCase.execute(
      authReq.user!.userId,
      req.body
    );
    return res.status(200).json(profile);
  }

  async uploadAvatar(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await this.uploadAvatarUseCase.execute(
      authReq.user!.userId,
      req.file
    );

    return res.status(200).json(result);
  }

  async deleteAvatar(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const result = await this.deleteAvatarUseCase.execute(authReq.user!.userId);
    return res.status(200).json(result);
  }
}
```

---
## File: server-only\src\presentation\controllers\SignupController.ts
```ts
// import { Request, Response, NextFunction } from 'express';
// import { inject, injectable } from 'inversify';
// import { TYPES } from '../../shared/di/types';
// import { RegisterUserUseCase } from '../../application/auth/RegisterUserUseCase';
// import { RequestSignupOtpUseCase } from '../../application/auth/RequestSignupOtpUseCase';
// import { VerifySignupOtpUseCase } from '../../application/auth/VerifySignupOtpUseCase';
// import { TokenServicePort } from '../../application/ports/TokenServicePort';
// import { CreateRefreshTokenUseCase } from '../../application/auth/CreateRefreshTokenUseCase';
// import { AppError } from '../../shared/errors/AppError';


// @injectable()
// export class SignupController {
//   constructor(
//     @inject(TYPES.RegisterUserUseCase)
//     private registerUserUseCase: RegisterUserUseCase,

//     @inject(TYPES.RequestSignupOtpUseCase)
//     private requestSignupOtpUseCase: RequestSignupOtpUseCase,

//     @inject(TYPES.VerifySignupOtpUseCase)
//     private verifySignupOtpUseCase: VerifySignupOtpUseCase,

//     @inject(TYPES.TokenServicePort)
//     private tokenService: TokenServicePort,

//     @inject(TYPES.CreateRefreshTokenUseCase)
//     private createRefreshTokenUseCase: CreateRefreshTokenUseCase
//   ) {}

//   async requestOtp(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { email } = req.body;
      
//       // RequestSignupOtpUseCase returns a Date directly
//       const expiresAt = await this.requestSignupOtpUseCase.execute(email);

//       res.status(200).json({
//         message: 'OTP sent to email',
//         expiresAt,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async verifyOtp(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { email, otp } = req.body;
//       await this.verifySignupOtpUseCase.execute(email, otp);

//       res.status(200).json({
//         message: 'OTP verified successfully',
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async signup(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { email, password, otp,firstName, lastName } = req.body;

//       // 1. Verify OTP first
//       await this.verifySignupOtpUseCase.execute(email, otp);

//           // console.log(firstName, lastName)

//       // 2. Register user (returns User entity)
//       const user = await this.registerUserUseCase.execute({
//         email,
//         password,
//         firstName,
//         lastName
//       });

//       // 3. Type safety check - ensure user.id exists
//       if (!user.id) {
//         throw new AppError('User registration failed: No user ID generated', 500);
//       }

//       // 4. Generate access token
//       const accessToken = this.tokenService.generateAccessToken({
//         userId: user.id, // Now TypeScript knows this is string, not string | undefined
//         role: user.role,
//       });

//       // 5. Create refresh token
//       const {token} = await this.createRefreshTokenUseCase.execute(user.id);

//       // 6. Set refresh token as HTTP-only cookie (same as login)
//       res.cookie('refreshToken', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       });

//       // 7. Return success response with tokens
//       res.status(201).json({
//         message: 'User registered successfully',
//         user,
//         accessToken,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { RequestSignupOtpUseCase } from "../../application/auth/RequestSignupOtpUseCase";
import { VerifySignupOtpUseCase } from "../../application/auth/VerifySignupOtpUseCase";
import { SignupUseCase } from "../../application/auth/SignupUseCase";
import { Request , Response} from "express";
import { env } from "../../shared/config/env";
import { authConfig } from "../../shared/config/auth.config";

@injectable()
export class SignupController {
  constructor (
    @inject (TYPES.RequestSignupOtpUseCase)
    private readonly requestSignupOtpUseCase: RequestSignupOtpUseCase,

    @inject(TYPES.VerifySignupOtpUseCase)
    private readonly verifySignupOtpUseCase: VerifySignupOtpUseCase,

    @inject(TYPES.SignupUseCase)
    private readonly signupUseCase: SignupUseCase,
  ) {}

  async requestOtp (req: Request, res: Response): Promise <Response> {
    const { email } = req.body;
    const expiresAt = await this.requestSignupOtpUseCase.execute(email);

    return res.status(200).json({
      message: 'OTP sent to email',
      expiresAt,
    });
  }

  async verifyOtp(req: Request, res: Response) :Promise<Response> {
    const { email, otp } = req.body;
    await this.verifySignupOtpUseCase.execute(email,otp);

    return res.status(200).json({
      message: 'OTP verified successfully',
    })
  }
  
  async signup(req: Request, res: Response) {
    const { email, password, otp, firstName, lastName } = req.body;

    const result = await this.signupUseCase.execute({
      email,
      password,
      otp,
      firstName,
      lastName,
    });

    res.cookie('refreshToken', result.refreshToken,{
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: authConfig.refreshToken.expiresInMs,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
    })
  }
}
```

---
## File: server-only\src\presentation\middlewares\error.middleware.ts
```ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  logger.error('Unhandled error', err);

  return res.status(500).json({
    message: 'Internal server error',
  });
}

```

---
## File: server-only\src\presentation\middlewares\validationRequest.ts
```ts
import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorTree = z.treeifyError(result.error);

      return res.status(400).json({
        message: 'Invalid request data',
        errors: errorTree,
      });
    }

    req.body = result.data;
    next();
  };
}

```

---
## File: server-only\src\presentation\routes\auth.routes.ts
```ts
import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { LoginController } from '../controllers/LoginController';
import { SignupController } from '../controllers/SignupController';
import { PasswordResetController } from '../controllers/PasswordResetController';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { validateRequest } from '../middlewares/validationRequest';
import {
  loginSchema,
  requestOtpSchema,
  resetPasswordSchema,
  signupSchema,
  verifyOtpSchema 
} from '../validators/auth.validators';

const router = Router();

// Get controllers
const loginController = container.get<LoginController>(TYPES.LoginController);
const signupController = container.get<SignupController>(TYPES.SignupController);
const passwordResetController = container.get<PasswordResetController>(
  TYPES.PasswordResetController
);

// ==================== LOGIN ====================
router.post(
  '/login',
  validateRequest(loginSchema),
  loginController.login.bind(loginController)
);

router.get(
  '/me',
  jwtAuthMiddleware,
  loginController.getCurrentUser.bind(loginController)
);

router.post('/refresh', loginController.refreshToken.bind(loginController));

router.post(
  '/logout',
  jwtAuthMiddleware,
  loginController.logout.bind(loginController)
);

// ==================== SIGNUP ====================
router.post(
  '/request-otp',
  validateRequest(requestOtpSchema),
  signupController.requestOtp.bind(signupController)
);

router.post(
  '/verify-otp',
  validateRequest(verifyOtpSchema),
  signupController.verifyOtp.bind(signupController)
);

router.post(
  '/signup',
  validateRequest(signupSchema),
  signupController.signup.bind(signupController)
);

// ==================== PASSWORD RESET ====================
router.post(
  '/forgot-password/request-otp',
  validateRequest(requestOtpSchema),
  passwordResetController.requestOtp.bind(passwordResetController)
);

router.post(
  '/forgot-password/verify-otp',
  validateRequest(verifyOtpSchema),
  passwordResetController.verifyOtp.bind(passwordResetController)
);

router.post(
  '/forgot-password/reset',
  validateRequest(resetPasswordSchema),
  passwordResetController.resetPassword.bind(passwordResetController)
);

export default router;
```

---
## File: server-only\src\presentation\routes\health.routes.ts
```ts
import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

router.get('/', HealthController.check);

export default router;

```

---
## File: server-only\src\presentation\routes\index.ts
```ts
import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// Register feature routes here
router.use('/health', healthRoutes);

export default router;

```

---
## File: server-only\src\presentation\routes\instructor.routes.ts
```ts
import { Router } from "express";
import { container } from "../../infrastructure/di/container";
import { InstructorController } from "../controllers/InstructorController";
import { TYPES } from "../../shared/di/types";
import { jwtAuthMiddleware } from "../../infrastructure/security/jwt-auth.middleware";
import { adminAuthMiddleware } from '../../infrastructure/security/admin-auth.middleware';
import { validateRequest } from '../middlewares/validationRequest';
import { applyForInstructorSchema } from '../validators/instructor.validators';


const router = Router();

//Resolve controller from DI container
const instructorController = container.get<InstructorController>(
    TYPES.InstructorController
);

/* ================= INSTRUCTOR ================= */

router.post(
  '/apply',
  jwtAuthMiddleware,
  validateRequest(applyForInstructorSchema),
  instructorController.apply.bind(instructorController)
);

router.get(
  '/status',
  jwtAuthMiddleware,
  instructorController.getStatus.bind(instructorController)
);


// Admin routes (admin only)
router.get(
  '/applications',
  jwtAuthMiddleware,
  adminAuthMiddleware,
  instructorController.listApplications.bind(instructorController)
);

router.post(
  '/applications/:applicationId/approve',
  jwtAuthMiddleware,
  adminAuthMiddleware,
  instructorController.approveApplication.bind(instructorController)
);

router.post(
  '/applications/:applicationId/reject',
  jwtAuthMiddleware,
  adminAuthMiddleware,
  instructorController.rejectApplication.bind(instructorController)
);
export default router;

```

---
## File: server-only\src\presentation\routes\profile.routes.ts
```ts
import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { ProfileController } from '../controllers/ProfileController';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { upload } from '../../infrastructure/middlewares/upload.middleware';

const router = Router();

const profileController = container.get<ProfileController>(
  TYPES.ProfileController
);

// All profile routes are protected
router.use(jwtAuthMiddleware);

router.get('/', profileController.getProfile.bind(profileController));
router.patch('/', profileController.updateProfile.bind(profileController));
router.post(
  '/avatar',
  upload.single('avatar'),
  profileController.uploadAvatar.bind(profileController)
);
router.delete('/avatar', profileController.deleteAvatar.bind(profileController));

export default router;
```

---
## File: server-only\src\presentation\utils\controller.factory.ts
```ts
import { container } from "../../infrastructure/di/container";

export function getController<T>(type: symbol): T {
    return container.get<T>(type);
}
```

---
## File: server-only\src\presentation\utils\cookie.helper.ts
```ts
import { env } from "../../shared/config/env";
import { Request, Response } from "express";

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite : 'strict' as const,
    path: '/',
};

export class CookieHelper {
    static setRefreshTokenCookie(
        res: Response,
        token: string,
        maxAgeMs: number
    ): void{
        res.cookie(REFRESH_TOKEN_COOKIE_NAME,token, {
            ...COOKIE_OPTIONS,
            maxAge: maxAgeMs,
        });
    }

    static clearRefreshTokenCookie(res: Response): void {
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME,{
            ...COOKIE_OPTIONS,
            maxAge: 0,
        });
    }
    static getRefreshToken (req: Request): string | null {
        const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
        return token ?? null;
    }

}
```

---
## File: server-only\src\presentation\validators\auth.validators.ts
```ts
import { z } from 'zod';

// Email regex for proper validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  
  firstName: z
    .string()
    .min(1, 'First name cannot be empty if provided')
    .max(100, 'First name cannot exceed 100 characters')
    .optional(),
  
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty if provided')
    .max(100, 'Last name cannot exceed 100 characters')
    .optional(),
});

export const requestOtpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format'),
  purpose: z.enum(['signup', 'forgot-password']).optional(),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
});
```

---
## File: server-only\src\presentation\validators\instructor.validators.ts
```ts
import { z } from 'zod';

export const applyForInstructorSchema = z.object({
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio cannot exceed 1000 characters'),
  experienceYears: z.string().min(1, 'Experience years is required'),
  teachingExperience: z.enum(['yes', 'no']),
  courseIntent: z
    .string()
    .min(20, 'Course intent must be at least 20 characters')
    .max(500, 'Course intent cannot exceed 500 characters'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().min(1, 'Language is required'),
});

export const rejectApplicationSchema = z.object({
  reason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});
```

---
## File: server-only\src\presentation\validators\profile.validators.ts
```ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
});
```

---
## File: server-only\src\server.ts
```ts
import 'reflect-metadata';

import { createExpressApp } from './infrastructure/http/express';
import { env } from './shared/config/env';
import { logger } from './shared/utils/logger';
import {
  connectDatabase,
  disconnectDatabase,
} from './infrastructure/database/mongoose.connection';
import { initRedis } from './infrastructure/redis/redis.client';
import './infrastructure/di/container';



async function startServer() {
  await connectDatabase();
  await initRedis();
  const app = createExpressApp();

  const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });

  function shutdown(signal: string) {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      await disconnectDatabase();
      logger.info('HTTP server closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forcing shutdown');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();

```

---
## File: server-only\src\shared\config\auth.config.ts
```ts
export const authConfig = {
    accessToken: {
        expiresIn: '15m',
    },
    refreshToken: {
        expiresInDays: 7,
        expiresInMs: 7 * 24 * 60 * 60 * 1000,
    }, 

    otp: {
        ttlSeconds: 120,
        maxAttempts: 5,
    }, 
} as const;
```

---
## File: server-only\src\shared\config\env.ts
```ts
import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function requireNumberEnv(key: string): number{
  const value = Number(requireEnv(key));
  if(Number.isNaN(value)){
    throw new Error(`Environment variable ${key} must be a number`)
  }
  return value;
}

export const env = {
  // Server
  port: Number(requireEnv('PORT')),
  nodeEnv: requireEnv('NODE_ENV'),

  // Database
  mongoUri: requireEnv('MONGO_URI'),

  // Redis (RESTORED)
  redisHost: requireEnv('REDIS_HOST'),
  redisPort: requireNumberEnv('REDIS_PORT'),
  redisPassword: process.env.REDIS_PASSWORD, // optional

  // Auth / Security
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ??
    '1d') as SignOptions['expiresIn'],

  //nodemailer
  deepLearnEmail: requireEnv('DEEP_LEARN_EMAIL'),
  deepLearnPassword: requireEnv('DEEP_LEARN_PASS'),
  
  //s3
  storageProvider: requireEnv('STORAGE_PROVIDER'),
  awsRegion: requireEnv('AWS_REGION'),
  awsAccessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
  awsSecretAccessKey:requireEnv('AWS_SECRET_ACCESS_KEY'),
  awsBucketName: requireEnv('AWS_BUCKET_NAME')
};

```

---
## File: server-only\src\shared\config\storage.config.ts
```ts
import { env } from "./env";

export const  storageConfig = {
    provider: env.storageProvider || 's3',

    aws: {
        region:env.awsRegion || 'ap-south-1',
        accessKeyId:env.awsAccessKeyId || ' ',
        secretAccessKey: env.awsSecretAccessKey || '',
        bucketName: env.awsBucketName || 'deep-learn-assets'
    },

    limits: {
        maxFileSize: 5 * 1024 * 1024, //5MB
        allowedMimeTypes: ['image/jped', 'image/png', 'image/webp', 'image/gif'],
    },
}
```

---
## File: server-only\src\shared\di\types.ts
```ts
import { SignupUseCase } from "../../application/auth/SignupUseCase";

export const TYPES = {
  // ======================
  // Repositories (Ports)
  // ======================
  UserRepositoryPort: Symbol.for('UserRepositoryPort'),
  RefreshTokenRepositoryPort: Symbol.for('RefreshTokenRepositoryPort'),
  InstructorApplicationRepositoryPort: Symbol.for(
  'InstructorApplicationRepositoryPort'
),

  // ======================
  // Services (Ports)
  // ======================
  OtpServicePort: Symbol.for('OtpServicePort'),
  PasswordHasherPort: Symbol.for('PasswordHasherPort'),
  TokenServicePort: Symbol.for('TokenServicePort'),

  // ======================
  // Use Cases
  // ======================
  LoginUserUseCase: Symbol.for('LoginUserUseCase'),
  RegisterUserUseCase: Symbol.for('RegisterUserUseCase'),
  ResetPasswordUseCase: Symbol.for('ResetPasswordUseCase'),
  GetCurrentUserUseCase: Symbol.for('GetCurrentUserUseCase'),
  RequestSignupOtpUseCase: Symbol.for('RequestSignupOtpUseCase'),
  VerifySignupOtpUseCase: Symbol.for('VerifySignupOtpUseCase'),
  RequestPasswordResetOtpUseCase: Symbol.for('RequestPasswordResetOtpUseCase'),
  VerifyPasswordResetOtpUseCase: Symbol.for('VerifyPasswordResetOtpUseCase'),
  CreateRefreshTokenUseCase: Symbol.for('CreateRefreshTokenUseCase'),
  RefreshAccessTokenUseCase: Symbol.for('RefreshAccessTokenUseCase'),
  RevokeRefreshTokenUseCase: Symbol.for('RevokeRefreshTokenUseCase'),
  LogoutUserUseCase: Symbol.for('LogoutUserUseCase'),

  // Instructor-related (add more later as needed)
  ApplyForInstructorUseCase: Symbol.for('ApplyForInstructorUseCase'),
  GetInstructorStatusUseCase: Symbol.for('GetInstructorStatusUseCase'),ListInstructorApplicationsUseCase: Symbol.for('ListInstructorApplicationsUseCase'),  // ← ADD
  ApproveInstructorApplicationUseCase: Symbol.for('ApproveInstructorApplicationUseCase'),  // ← ADD
  RejectInstructorApplicationUseCase: Symbol.for('RejectInstructorApplicationUseCase'),  // ← ADD

  // JwtAuthMiddleware: Symbol.for('JwtAuthMiddleware'),
  

  // ======================
  // Controllers
  // ======================
  AuthController: Symbol.for('AuthController'),

  // Profile
  GetProfileUseCase: Symbol.for('GetProfileUseCase'),
  UpdateProfileUseCase: Symbol.for('UpdateProfileUseCase'),
  UploadAvatarUseCase: Symbol.for('UploadAvatarUseCase'),
  DeleteAvatarUseCase: Symbol.for('DeleteAvatarUseCase'),
  
  // Storage
  StorageServicePort: Symbol.for('StorageServicePort'),
  
  // Controllers (updated)
  LoginController: Symbol.for('LoginController'),
  SignupController: Symbol.for('SignupController'),
  PasswordResetController: Symbol.for('PasswordResetController'),
  InstructorController: Symbol.for('InstructorController'),
  ProfileController: Symbol.for('ProfileController'),

  UserReaderPort: Symbol.for('UserReaderPort'),
  UserWriterPort: Symbol.for('UserWriterPort'),
  SignupUseCase: Symbol.for('SignupUseCase'),
};

```

---
## File: server-only\src\shared\errors\AppError.ts
```ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

```

---
## File: server-only\src\shared\utils\idGenerator.ts
```ts
import { randomBytes } from 'crypto';

export function generateId(): string {
  return randomBytes(12).toString('hex');
}
```

---
## File: server-only\src\shared\utils\logger.ts
```ts
export const logger = {
  info(message: string) {
    console.log(`[INFO] ${message}`);
  },

  warn(message: string) {
    console.warn(`[WARN] ${message}`);
  },

  error(message: string, error?: unknown) {
    console.error(`[ERROR] ${message}`);
    if (error) {
      console.error(error);
    }
  },
};

```

---
## File: server-only\tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "CommonJS",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // "types": ["reflect-metadata"],
    "lib": ["ES2021"],   // or higher
  }
}

```

---
