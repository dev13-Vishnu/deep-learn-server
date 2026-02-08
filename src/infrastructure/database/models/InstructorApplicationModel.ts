import { Schema, model, Document, Types } from 'mongoose';

export interface IInstructorApplicationDocument extends Document {
  userId: Types.ObjectId;
  bio: string;
  experienceYears: string;
  teachingExperience: 'yes' | 'no';
  courseIntent: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const instructorApplicationSchema = new Schema<IInstructorApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String, required: true },
    experienceYears: { type: String, required: true },
    teachingExperience: { 
      type: String, 
      enum: ['yes', 'no'], 
      required: true 
    },
    courseIntent: { type: String, required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: null },  // ← ADD
  },
  { timestamps: true }
);

instructorApplicationSchema.index({ status: 1, createdAt: -1 });

export const InstructorApplicationModel = model<IInstructorApplicationDocument>(
  'InstructorApplication',
  instructorApplicationSchema
);