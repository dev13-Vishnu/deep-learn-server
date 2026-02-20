import mongoose, { Schema, Document, Model } from 'mongoose';
import { OAuthProvider } from '../../../domain/entities/OAuthConnection';

export interface OAuthConnectionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  linkedAt: Date;
}

const OAuthConnectionSchema = new Schema<OAuthConnectionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['google', 'facebook', 'microsoft'] as OAuthProvider[],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
    },
    linkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index: one connection per provider per user
OAuthConnectionSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export const OAuthConnectionModel: Model<OAuthConnectionDocument> =
  mongoose.model<OAuthConnectionDocument>('OAuthConnection', OAuthConnectionSchema);