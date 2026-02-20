import { injectable } from 'inversify';
import { OAuthConnectionRepositoryPort } from '../../../application/ports/OAuthConnectionRepositoryPort';
import { OAuthConnection, OAuthProvider } from '../../../domain/entities/OAuthConnection';
import { OAuthConnectionModel, OAuthConnectionDocument } from '../models/OAuthConnectionModel';

@injectable()
export class MongoOAuthConnectionRepository implements OAuthConnectionRepositoryPort {
  async findByProvider(
    provider: OAuthProvider,
    providerId: string
  ): Promise<OAuthConnection | null> {
    const doc = await OAuthConnectionModel.findOne({ provider, providerId }).lean();
    return doc ? this.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<OAuthConnection[]> {
    const docs = await OAuthConnectionModel.find({ userId }).lean();
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(connection: OAuthConnection): Promise<OAuthConnection> {
    const doc = await OAuthConnectionModel.create({
      userId: connection.userId,
      provider: connection.provider,
      providerId: connection.providerId,
      email: connection.email,
      name: connection.name,
      avatarUrl: connection.avatarUrl,
      linkedAt: connection.linkedAt,
    });

    return this.toDomain(doc);
  }

  private toDomain(doc: OAuthConnectionDocument | (Partial<OAuthConnectionDocument> & { _id: unknown })): OAuthConnection {
    return new OAuthConnection(
      (doc._id as { toString(): string }).toString(),
      doc.userId?.toString() ?? '',
      doc.provider as OAuthProvider,
      doc.providerId as string,
      doc.email as string,
      doc.name as string,
      doc.avatarUrl ?? undefined,
      doc.linkedAt ?? new Date()
    );
  }
}