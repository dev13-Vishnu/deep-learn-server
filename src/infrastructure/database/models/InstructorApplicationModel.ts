import { Schema, model } from 'mongoose';

const instructorApplicationSchema = new Schema<IInstructorApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String, required: true },
    experienceYears: { type: String, required: true },
    teachingExperience: { type: String, required: true },
    courseIntent: { type: String, required: true },
    level: { type: String, required: true },
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

// Add index for admin queries
instructorApplicationSchema.index({ status: 1, createdAt: -1 });