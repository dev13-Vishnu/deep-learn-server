import { z } from 'zod';

export const instructorApplySchema = z.object({
  bio: z.string().min(10).max(300),
  experienceYears: z.enum(['0-1', '2-4', '5-9', '10+']),
  teachingExperience: z.enum(['yes', 'no']),
  courseIntent: z.string().min(10),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().min(2),
});

export type InstructorApplyDTO = z.infer<
  typeof instructorApplySchema
>;
