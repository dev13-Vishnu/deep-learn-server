import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { PasswordHasher } from "../../infrastructure/security/password-hasher";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";

export class ResetPasswordUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(emailRaw: string, newPasswordRaw: string): Promise<void> {
    const email = new Email(emailRaw);
    const newPassword = new Password(newPasswordRaw);

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return; // silent success
    }

    const hashedPassword = await PasswordHasher.hash(
      newPassword.getValue()
    );

    user.changePassword(hashedPassword);

    await this.userRepo.update(user);
  }
}
