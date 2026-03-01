import { z } from 'zod';

const courseCategories = ['development', 'design', 'business', 'marketing', 'photography', 'music', 'health', 'other'] as const;
const courseLevels     = ['beginner', 'intermediate', 'advanced', 'all'] as const;

export const createCourseSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3,   'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),

  subtitle: z
    .string()
    .max(200, 'Subtitle cannot exceed 200 characters')
    .optional()
    .nullable(),

  description: z
    .string({ required_error: 'Description is required' })
    .min(20,   'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),

  category: z.enum(courseCategories, {
    required_error: 'Category is required',
    message: `Category must be one of: ${courseCategories.join(', ')}`,
  }),

  level: z.enum(courseLevels, {
    required_error: 'Level is required',
    message: `Level must be one of: ${courseLevels.join(', ')}`,
  }),

  language: z
    .string({ required_error: 'Language is required' })
    .min(1, 'Language is required'),

  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .optional()
    .default(0),

  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code')
    .optional()
    .default('USD'),

  tags: z
    .array(z.string().max(30, 'Each tag cannot exceed 30 characters'))
    .max(10, 'Cannot have more than 10 tags')
    .optional()
    .default([]),
});