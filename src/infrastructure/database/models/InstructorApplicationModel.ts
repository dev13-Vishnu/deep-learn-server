import { Schema, model } from 'mongoose';

const InstructorApplicationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    bio: { type: String, required: true },
    experienceYears: { type: String, required: true },
    teachingExperience: { type: String, required: true },
    courseIntent: { type: String, required: true },
    level: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, required: true },
    adminFeedback: { type: String },
  },
  { timestamps: true }
);

export const InstructorApplicationModel = model(
  'InstructorApplication',
  InstructorApplicationSchema
);
