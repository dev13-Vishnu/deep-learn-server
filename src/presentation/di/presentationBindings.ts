import { Container } from 'inversify';
import { PRESENTATION_TYPES } from './presentationTypes';

// Controllers
import { LoginController }           from '../controllers/LoginController';
import { SignupController }           from '../controllers/SignupController';
import { OAuthController }            from '../controllers/OAuthController';
import { PasswordResetController }    from '../controllers/PasswordResetController';
import { ProfileController }          from '../controllers/ProfileController';
import { CourseController }           from '../controllers/CourseController';
import { InstructorController }       from '../controllers/InstructorController';

// Http Adapters
import { AuthHttpAdapter }            from '../http/AuthHttpAdapter';
import { SignupHttpAdapter }          from '../http/SignupHttpAdapter';
import { OAuthHttpAdapter }           from '../http/OAuthHttpAdapter';
import { ProfileHttpAdapter }         from '../http/ProfileHttpAdapter';
import { CourseHttpAdapter }          from '../http/CourseHttpAdapter';
import { InstructorHttpAdapter }      from '../http/InstructorHttpAdapter';

export function bindPresentationDependencies(container: Container): void {
  // Controllers
  container.bind(PRESENTATION_TYPES.LoginController).to(LoginController);
  container.bind(PRESENTATION_TYPES.SignupController).to(SignupController);
  container.bind(PRESENTATION_TYPES.OAuthController).to(OAuthController);
  container.bind(PRESENTATION_TYPES.PasswordResetController).to(PasswordResetController);
  container.bind(PRESENTATION_TYPES.ProfileController).to(ProfileController);
  container.bind(PRESENTATION_TYPES.CourseController).to(CourseController);
  container.bind(PRESENTATION_TYPES.InstructorController).to(InstructorController);

  // Http Adapters
  container.bind(PRESENTATION_TYPES.AuthHttpAdapter).to(AuthHttpAdapter);
  container.bind(PRESENTATION_TYPES.SignupHttpAdapter).to(SignupHttpAdapter);
  container.bind(PRESENTATION_TYPES.OAuthHttpAdapter).to(OAuthHttpAdapter);
  container.bind(PRESENTATION_TYPES.ProfileHttpAdapter).to(ProfileHttpAdapter);
  container.bind(PRESENTATION_TYPES.CourseHttpAdapter).to(CourseHttpAdapter);
  container.bind(PRESENTATION_TYPES.InstructorHttpAdapter).to(InstructorHttpAdapter);
}