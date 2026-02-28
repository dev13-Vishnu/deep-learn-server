import 'reflect-metadata';

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
import { S3StorageService } from '../storage/s3.storage';

// Use cases — Auth
import { LoginUserUseCase } from '../../application/auth/LoginUserUseCase';
import { ResetPasswordUseCase } from '../../application/auth/ResetPasswordUseCase';
import { GetCurrentUserUseCase } from '../../application/auth/GetCurrentUserUseCase';
import { RequestSignupOtpUseCase } from '../../application/auth/RequestSignupOtpUseCase';
import { VerifySignupOtpUseCase } from '../../application/auth/VerifySignupOtpUseCase';
import { RequestPasswordResetOtpUseCase } from '../../application/auth/RequestPasswordResetOtpUseCase';
import { VerifyPasswordResetOtpUseCase } from '../../application/auth/VerifyPasswordResetOtpUseCase';
import { CreateRefreshTokenUseCase } from '../../application/auth/CreateRefreshTokenUseCase';
import { RefreshAccessTokenUseCase } from '../../application/auth/RefreshAccessTokenUseCase';
import { RevokeRefreshTokenUseCase } from '../../application/auth/RevokeRefreshTokenUseCase';
import { SignupUseCase } from '../../application/auth/SignupUseCase';

// Use cases — Instructor
import { ApplyForInstructorUseCase } from '../../application/instructor/ApplyForInstructorUseCase';
import { GetInstructorStatusUseCase } from '../../application/instructor/GetInstructorStatusUseCase';
import { ListInstructorApplicationsUseCase } from '../../application/instructor/ListInstructorApplicationsUseCase';
import { ApproveInstructorApplicationUseCase } from '../../application/instructor/ApproveInstructorApplicationUseCase';
import { RejectInstructorApplicationUseCase } from '../../application/instructor/RejectInstructorApplicationUseCase';

// Use cases — Profile
import { GetProfileUseCase } from '../../application/profile/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../application/profile/UpdateProfileUseCase';
import { UploadAvatarUseCase } from '../../application/profile/UploadAvatarUseCase';
import { DeleteAvatarUseCase } from '../../application/profile/DeleteAvatarUseCase';

// Controllers
import { LoginController } from '../../presentation/controllers/LoginController';
import { SignupController } from '../../presentation/controllers/SignupController';
import { PasswordResetController } from '../../presentation/controllers/PasswordResetController';
import { InstructorController } from '../../presentation/controllers/InstructorController';
import { ProfileController } from '../../presentation/controllers/ProfileController';

// OAuth
import { bindOAuthDependencies } from './oauthBindings';

export const container = new Container();

//  Repositories 

container.bind(TYPES.UserRepositoryPort).to(MongoUserRepository);
container.bind(TYPES.RefreshTokenRepositoryPort).to(MongoRefreshTokenRepository);
container
  .bind(TYPES.InstructorApplicationRepositoryPort)
  .to(MongoInstructorApplicationRepository);

// Split interfaces bound to same implementation
container.bind(TYPES.UserReaderPort).to(MongoUserRepository);
container.bind(TYPES.UserWriterPort).to(MongoUserRepository);

//  Services 

container.bind(TYPES.PasswordHasherPort).to(BcryptPasswordHasher);
container.bind(TYPES.TokenServicePort).to(JwtTokenService);
container.bind(TYPES.OtpServicePort).to(RedisOtpService);
container.bind(TYPES.StorageServicePort).to(S3StorageService);

//  Use Cases — Auth 

container.bind(TYPES.LoginUserUseCase).to(LoginUserUseCase);
container.bind(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase);
container.bind(TYPES.GetCurrentUserUseCase).to(GetCurrentUserUseCase);
container.bind(TYPES.RequestSignupOtpUseCase).to(RequestSignupOtpUseCase);
container.bind(TYPES.VerifySignupOtpUseCase).to(VerifySignupOtpUseCase);
container
  .bind(TYPES.RequestPasswordResetOtpUseCase)
  .to(RequestPasswordResetOtpUseCase);
container
  .bind(TYPES.VerifyPasswordResetOtpUseCase)
  .to(VerifyPasswordResetOtpUseCase);
container.bind(TYPES.CreateRefreshTokenUseCase).to(CreateRefreshTokenUseCase);
container.bind(TYPES.RefreshAccessTokenUseCase).to(RefreshAccessTokenUseCase);
container.bind(TYPES.RevokeRefreshTokenUseCase).to(RevokeRefreshTokenUseCase);
container.bind(TYPES.SignupUseCase).to(SignupUseCase);

//  Use Cases — Instructor 

container.bind(TYPES.ApplyForInstructorUseCase).to(ApplyForInstructorUseCase);
container
  .bind(TYPES.GetInstructorStatusUseCase)
  .to(GetInstructorStatusUseCase);
container
  .bind(TYPES.ListInstructorApplicationsUseCase)
  .to(ListInstructorApplicationsUseCase);
container
  .bind(TYPES.ApproveInstructorApplicationUseCase)
  .to(ApproveInstructorApplicationUseCase);
container
  .bind(TYPES.RejectInstructorApplicationUseCase)
  .to(RejectInstructorApplicationUseCase);

//  Use Cases — Profile 

container.bind(TYPES.GetProfileUseCase).to(GetProfileUseCase);
container.bind(TYPES.UpdateProfileUseCase).to(UpdateProfileUseCase);
container.bind(TYPES.UploadAvatarUseCase).to(UploadAvatarUseCase);
container.bind(TYPES.DeleteAvatarUseCase).to(DeleteAvatarUseCase);

//  Controllers 

container.bind(TYPES.LoginController).to(LoginController);
container.bind(TYPES.SignupController).to(SignupController);
container.bind(TYPES.PasswordResetController).to(PasswordResetController);
container.bind(TYPES.InstructorController).to(InstructorController);
container.bind(TYPES.ProfileController).to(ProfileController);

//  OAuth 

bindOAuthDependencies(container);