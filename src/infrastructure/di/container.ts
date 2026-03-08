import 'reflect-metadata';

import { Container } from 'inversify';
import { TYPES } from '../../shared/di/types';

// Repositories
import { MongoUserRepository } from '../database/repositories/MongoUserRepository';
import { MongoRefreshTokenRepository } from '../database/repositories/MongoRefreshTokenRepository';
import { MongoInstructorApplicationRepository } from '../database/repositories/MongoInstructorApplicationRepository';
import { MongoCourseRepository } from '../database/repositories/MongoCourseRepository';

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

// Use cases — Course
import { CreateCourseUseCase } from '../../application/course/CreateCourseUseCase';
import { UpdateCourseUseCase } from '../../application/course/UpdateCourseUseCase';



// OAuth
import { bindOAuthDependencies } from './oauthBindings';
import { ListTutorCoursesUseCase } from '../../application/course/ListTutorCoursesUseCase';
import { GetTutorCourseUseCase } from '../../application/course/GetTutorCourseUseCase';
import { DeleteCourseUseCase } from '../../application/course/DeleteCourseUseCase';
import { UploadThumbnailUseCase } from '../../application/course/UploadThumbnailUseCase';
import { PublishCourseUseCase } from '../../application/course/PublishCourseUseCase';
import { UnpublishCourseUseCase } from '../../application/course/UnpublishCourseUseCase';
import { ArchiveCourseUseCase } from '../../application/course/ArchiveCourseUseCase';
import { ReorderModulesUseCase } from '../../application/course/ReorderModulesUseCase';
import { RemoveModuleUseCase } from '../../application/course/RemoveModuleUseCase';
import { UpdateModuleUseCase } from '../../application/course/UpdateModuleUseCase';
import { AddModuleUseCase } from '../../application/course/AddModuleUseCase';
import { AddLessonUseCase } from '../../application/course/AddLessonUseCase';
import { UpdateLessonUseCase } from '../../application/course/UpdateLessonUseCase';
import { RemoveLessonUseCase } from '../../application/course/RemoveLessonUseCase';
import { ReorderLessonsUseCase } from '../../application/course/ReorderLessonsUseCase';
import { AddChapterUseCase } from '../../application/course/AddChapterUseCase';
import { UpdateChapterUseCase } from '../../application/course/UpdateChapterUseCase';
import { RemoveChapterUseCase } from '../../application/course/RemoveChapterUseCase';
import { ReorderChaptersUseCase } from '../../application/course/ReorderChaptersUseCase';
import { GetVideoUploadUrlUseCase } from '../../application/course/GetVideoUploadUrlUseCase';
import { ConfirmVideoUploadUseCase } from '../../application/course/ConfirmVideoUploadUseCase';
import { ListPublicCoursesUseCase } from '../../application/course/ListPublicCoursesUseCase';
import { GetPublicCourseUseCase } from '../../application/course/GetPublicCourseUseCase';

import { bindPresentationDependencies } from '../../presentation/di/presentationBindings';

import { RedisClientAdapter }        from '../redis/RedisClientAdapter';
import { NodemailerEmailService }     from '../services/NodemailerEmailService';
import { RedisClientPort }            from '../../application/ports/RedisClientPort';
import { EmailServicePort }           from '../../application/ports/EmailServicePort';
import { CryptoIdGenerator } from '../utils/CryptoIdGenerator';
import { AppLoggerAdapter } from '../logging/AppLoggerAdapter';
import { JwtConfig } from '../../shared/config/types/JwtConfig';
import { EmailConfig } from '../../shared/config/types/EmailConfig';
import { StorageConfig } from '../../shared/config/types/StorageConfig';
import { storageConfig } from '../../shared/config/storage.config';
import { env } from '../../shared/config/env';



export const container = new Container();

//  Repositories

container.bind(TYPES.UserRepositoryPort).to(MongoUserRepository);
container.bind(TYPES.RefreshTokenRepositoryPort).to(MongoRefreshTokenRepository);
container.bind(TYPES.InstructorApplicationRepositoryPort).to(MongoInstructorApplicationRepository);
container.bind(TYPES.CourseRepositoryPort).to(MongoCourseRepository);

// Split interfaces bound to same implementation
container.bind(TYPES.UserReaderPort).to(MongoUserRepository);
container.bind(TYPES.UserWriterPort).to(MongoUserRepository);

// Infrastructure config values 
container.bind<JwtConfig>(TYPES.JwtConfig).toConstantValue({
  secret:    env.jwtSecret,
  expiresIn: env.jwtExpiresIn,
});

container.bind<EmailConfig>(TYPES.EmailConfig).toConstantValue({
  user:     env.deepLearnEmail,
  password: env.deepLearnPassword,
});

container.bind<StorageConfig>(TYPES.StorageConfig).toConstantValue({
  region:          storageConfig.aws.region,
  accessKeyId:     storageConfig.aws.accessKeyId,
  secretAccessKey: storageConfig.aws.secretAccessKey,
  bucketName:      storageConfig.aws.bucketName,
});
//  Services

container.bind(TYPES.PasswordHasherPort).to(BcryptPasswordHasher);
container.bind(TYPES.TokenServicePort).to(JwtTokenService);
container.bind(TYPES.OtpServicePort).to(RedisOtpService);
container.bind(TYPES.StorageServicePort).to(S3StorageService);
container.bind<RedisClientPort>(TYPES.RedisClientPort).to(RedisClientAdapter).inSingletonScope();
container.bind<EmailServicePort>(TYPES.EmailServicePort).to(NodemailerEmailService);

container.bind(TYPES.LoggerPort).to(AppLoggerAdapter).inSingletonScope();

//  Use Cases — Auth 

container.bind(TYPES.LoginUserUseCase).to(LoginUserUseCase);
container.bind(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase);
container.bind(TYPES.GetCurrentUserUseCase).to(GetCurrentUserUseCase);
container.bind(TYPES.RequestSignupOtpUseCase).to(RequestSignupOtpUseCase);
container.bind(TYPES.VerifySignupOtpUseCase).to(VerifySignupOtpUseCase);
container.bind(TYPES.RequestPasswordResetOtpUseCase).to(RequestPasswordResetOtpUseCase);
container.bind(TYPES.VerifyPasswordResetOtpUseCase).to(VerifyPasswordResetOtpUseCase);
container.bind(TYPES.CreateRefreshTokenUseCase).to(CreateRefreshTokenUseCase);
container.bind(TYPES.RefreshAccessTokenUseCase).to(RefreshAccessTokenUseCase);
container.bind(TYPES.RevokeRefreshTokenUseCase).to(RevokeRefreshTokenUseCase);
container.bind(TYPES.SignupUseCase).to(SignupUseCase);

container.bind(TYPES.CreateRefreshTokenPort).to(CreateRefreshTokenUseCase);

//  Use Cases — Instructor 

container.bind(TYPES.ApplyForInstructorUseCase).to(ApplyForInstructorUseCase);
container.bind(TYPES.GetInstructorStatusUseCase).to(GetInstructorStatusUseCase);
container.bind(TYPES.ListInstructorApplicationsUseCase).to(ListInstructorApplicationsUseCase);
container.bind(TYPES.ApproveInstructorApplicationUseCase).to(ApproveInstructorApplicationUseCase);
container.bind(TYPES.RejectInstructorApplicationUseCase).to(RejectInstructorApplicationUseCase);

//  Use Cases — Profile 

container.bind(TYPES.GetProfileUseCase).to(GetProfileUseCase);
container.bind(TYPES.UpdateProfileUseCase).to(UpdateProfileUseCase);
container.bind(TYPES.UploadAvatarUseCase).to(UploadAvatarUseCase);
container.bind(TYPES.DeleteAvatarUseCase).to(DeleteAvatarUseCase);

//  Use Cases — Course

container.bind(TYPES.CreateCourseUseCase).to(CreateCourseUseCase);
container.bind(TYPES.UpdateCourseUseCase).to(UpdateCourseUseCase);
container.bind(TYPES.ListTutorCoursesUseCase).to(ListTutorCoursesUseCase);
container.bind(TYPES.GetTutorCourseUseCase).to(GetTutorCourseUseCase);
container.bind(TYPES.DeleteCourseUseCase).to(DeleteCourseUseCase);
container.bind(TYPES.UploadThumbnailUseCase).to(UploadThumbnailUseCase);
container.bind(TYPES.PublishCourseUseCase).to(PublishCourseUseCase);
container.bind(TYPES.UnpublishCourseUseCase).to(UnpublishCourseUseCase);
container.bind(TYPES.ArchiveCourseUseCase).to(ArchiveCourseUseCase);
container.bind(TYPES.AddModuleUseCase).to(AddModuleUseCase);
container.bind(TYPES.UpdateModuleUseCase).to(UpdateModuleUseCase);
container.bind(TYPES.RemoveModuleUseCase).to(RemoveModuleUseCase);
container.bind(TYPES.ReorderModulesUseCase).to(ReorderModulesUseCase);
container.bind(TYPES.AddLessonUseCase).to(AddLessonUseCase);
container.bind(TYPES.UpdateLessonUseCase).to(UpdateLessonUseCase);
container.bind(TYPES.RemoveLessonUseCase).to(RemoveLessonUseCase);
container.bind(TYPES.ReorderLessonsUseCase).to(ReorderLessonsUseCase);

// Chapter Management 
container.bind(TYPES.AddChapterUseCase).to(AddChapterUseCase);
container.bind(TYPES.UpdateChapterUseCase).to(UpdateChapterUseCase);
container.bind(TYPES.RemoveChapterUseCase).to(RemoveChapterUseCase);
container.bind(TYPES.ReorderChaptersUseCase).to(ReorderChaptersUseCase);
// Video Upload
container.bind(TYPES.GetVideoUploadUrlUseCase).to(GetVideoUploadUrlUseCase);
container.bind(TYPES.ConfirmVideoUploadUseCase).to(ConfirmVideoUploadUseCase);
container.bind(TYPES.ListPublicCoursesUseCase).to(ListPublicCoursesUseCase);
container.bind(TYPES.GetPublicCourseUseCase).to(GetPublicCourseUseCase);

container.bind(TYPES.IdGeneratorPort).to(CryptoIdGenerator).inSingletonScope();


//  OAuth

bindOAuthDependencies(container);
bindPresentationDependencies(container);

