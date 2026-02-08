import 'reflect-metadata';

import { AuthController } from '../../presentation/controllers/auth.controller';
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
import { LoginUserUseCase } from '../../application/auth/LoginUser.usecase';
import { RegisterUserUseCase } from '../../application/auth/RegisterUser.usecase';
import { ResetPasswordUseCase } from '../../application/auth/ResetPassword.usecase';
import { GetCurrentUserUseCase } from '../../application/auth/GetCurrentUser.usecase';

import { RequestSignupOtpUseCase } from '../../application/auth/RequestSignupOtp.usecase';
import { VerifySignupOtpUseCase } from '../../application/auth/VerifySignupOtp.usecase';
import { RequestPasswordResetOtpUseCase } from '../../application/auth/RequestPasswordResetOtp.usecase';
import { VerifyPasswordResetOtpUseCase } from '../../application/auth/VerifyPasswordResetOtp.usecase';

import { CreateRefreshTokenUseCase } from '../../application/auth/CreateRefreshToken.usecase';
import { RefreshAccessTokenUseCase } from '../../application/auth/RefreshAccessToken.usecase';
import { RevokeRefreshTokenUseCase } from '../../application/auth/RevokeRefreshToken.usecase';

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

container
  .bind(TYPES.AuthController)
  .to(AuthController);

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