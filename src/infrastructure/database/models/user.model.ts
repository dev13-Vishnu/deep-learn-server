import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    firstName: {type: String},
    lastName: {type: String},
    bio: {type: String},
    avatarUrl: {type: String},
    
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel = model('User', UserSchema);
