import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {  
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
    type: Number,
    enum: [0, 1, 2],
    required: true,
  },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    firstName: { type: String, default : null },
    lastName: { type: String, default : null },
    avatarUrl: { type: String, default : null },
    bio: { type: String, default : null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel = model('User', UserSchema);
