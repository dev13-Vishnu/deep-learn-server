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
