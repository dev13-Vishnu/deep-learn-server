import { injectable } from 'inversify';
import { randomBytes } from 'crypto';
import { IdGeneratorPort } from '../../application/ports/IdGeneratorPort';

@injectable()
export class CryptoIdGenerator implements IdGeneratorPort {
  generate(): string {
    return randomBytes(12).toString('hex');
  }
}