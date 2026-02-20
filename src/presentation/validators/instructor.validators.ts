import { z } from 'zod';

export const applyForInstructorSchema = z.object({
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio cannot exceed 1000 characters'),
  experienceYears: z.string().min(1, 'Experience years is required'),
  teachingExperience: z.enum(['yes', 'no']),
  courseIntent: z
    .string()
    .min(20, 'Course intent must be at least 20 characters')
    .max(500, 'Course intent cannot exceed 500 characters'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().min(1, 'Language is required'),
});

export const rejectApplicationSchema = z.object({
  reason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});