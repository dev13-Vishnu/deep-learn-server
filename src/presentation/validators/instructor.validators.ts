import { z } from 'zod';


export const applyForInstructorSchema = z.object({
  bio:                z.string().min(1, 'Bio is required'),
  experienceYears:    z.string().min(1, 'Experience years is required'),
  teachingExperience: z.enum(['yes', 'no']),
  courseIntent:       z.string().min(1, 'Course intent is required'),
  level:              z.enum(['beginner', 'intermediate', 'advanced']),
  language:           z.string().min(1, 'Language is required'),
});

export const rejectApplicationSchema = z.object({
  reason: z
    .string()
    .min(10,  'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});