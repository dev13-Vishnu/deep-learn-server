import { injectable } from "inversify";
import { UserRepositoryPort } from "../../../application/ports/UserRepositoryPort";
import { User } from "../../../domain/entities/User";
import { UserRole } from "../../../domain/entities/UserRole";
import { Email } from "../../../domain/value-objects/Email";
import { UserModel } from "../models/user.model";

@injectable()
export class MongoUserRepository implements UserRepositoryPort {

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.getValue() });
    if (!doc) return null;

    return new User(
      new Email(doc.email),
      doc.role as UserRole,
      doc.passwordHash,
      doc.isActive,
      doc.emailVerified,
      doc._id.toString(),
      doc.firstName ?? undefined,
      doc.lastName ?? undefined,
      doc.bio ?? undefined,
      doc.avatarUrl ?? undefined,

    );
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      email: user.email.getValue(),
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    });

    return new User(
      new Email(doc.email),
      doc.role as UserRole,
      doc.passwordHash,
      doc.isActive,
      doc.emailVerified,
      doc._id.toString(), // ID assigned here
    );
  }

  async update(user: User): Promise<void> {
  const result = await UserModel.updateOne(
  { _id: user.id },
  {
    $set: {
      passwordHash: user.passwordHash,
      updatedAt: new Date(),
    },
  }
);

if (result.matchedCount === 0) {
  throw new Error('User not found during password reset');
}

}

async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if(!doc) return null;

    return new User (
      new Email(doc.email),
      doc.role,
      doc.passwordHash,
      doc.isActive,
      doc.emailVerified,
      doc._id.toString(),
      doc.firstName ?? undefined,
      doc.lastName ?? undefined,
      doc.bio ?? undefined,
      doc.avatarUrl ?? undefined,
    );
}

}
