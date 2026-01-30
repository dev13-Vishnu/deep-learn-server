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