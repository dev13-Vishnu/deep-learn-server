import { Schema, model, Document } from 'mongoose';

export interface IUserDocument extends Document {
  _id: any;
  email: string;
  passwordHash: string | null;
  role: number;
  isActive: boolean;
  emailVerified: boolean;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
  instructorState: 'not_applied' | 'pending' | 'approved' | 'rejected';
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, default: null },
    role: { type: Number, enum: [0, 1, 2], required: true,
   default: 0 },
   instructorState: {
      type: String,
      enum: ['not_applied', 'pending', 'approved', 'rejected'],
      default: 'not_applied'
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    avatar: { type: String, default: null },
    bio: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserModel = model<IUserDocument>('User', userSchema);