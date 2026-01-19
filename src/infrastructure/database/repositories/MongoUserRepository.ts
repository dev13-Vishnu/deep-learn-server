import { UserRepositoryPort } from "../../../application/ports/UserRepositoryPort";
import { User } from "../../../domain/entities/User";
import { UserRole } from "../../../domain/entities/UserRole";
import { Email } from "../../../domain/value-objects/Email";
import { UserModel } from "../models/user.model";

export class MongoUserRepository implements UserRepositoryPort{
    async findByEmail(email: Email): Promise<User | null> {
        const doc = await UserModel.findOne({
            email: email.getValue(),
        });

        if(!doc) {
            return null;
        }
        return new User(
            doc._id.toString(),
            new Email(doc.email),
            doc.role as UserRole,
            doc.passwordHash,
            doc.isActive,
            doc.emailVerified,
        );
    }

    async create(user: User) : Promise<void> {
        await UserModel.create({
            _id: user.id,
            email: user.email.getValue(),
            role: user.role,
            passwordHash: user.passwordHash,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
        });
    }
}