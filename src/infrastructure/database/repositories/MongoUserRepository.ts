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
    return this.toDomain(doc);  // ✅ Use helper
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create(this.toPersistence(user));  // ✅ Use helper
    return this.toDomain(doc);  // ✅ Use helper
  }

  async update(user: User): Promise<void> {
    const result = await UserModel.updateOne(
      { _id: user.id },
      { $set: this.toPersistence(user) }  // ✅ Use helper
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found during update');
    }
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);  // ✅ Use helper
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

  // ✅ HELPER: Convert DB document to Domain entity
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
      doc.avatar || null,
      doc.bio || null
    );
  }

  // ✅ HELPER: Convert Domain entity to DB document
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
      updatedAt: new Date(),
    };
  }
}