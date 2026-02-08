import { z } from 'zod';

export const applyForInstructorSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  experienceYears: z.string(),
  teachingExperience: z.enum(['yes', 'no']),
  courseIntent: z.string().min(20, 'Course intent must be at least 20 characters'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string(),
});