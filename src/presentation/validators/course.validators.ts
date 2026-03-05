import { z } from 'zod';

const courseCategories = [
  'development',
  'design',
  'business',
  'marketing',
  'photography',
  'music',
  'health',
  'other',
] as const;

const courseLevels = [
  'beginner',
  'intermediate',
  'advanced',
  'all',
] as const;

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),

  subtitle: z
    .string()
    .max(200, 'Subtitle cannot exceed 200 characters')
    .optional()
    .nullable(),

  description: z
    .string()
    .min(1, 'Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),

  category: z.enum(courseCategories, {
    message: `Category must be one of: ${courseCategories.join(', ')}`,
  }),

  level: z.enum(courseLevels, {
    message: `Level must be one of: ${courseLevels.join(', ')}`,
  }),

  language: z
    .string()
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
    .array(
      z.string().max(30, 'Each tag cannot exceed 30 characters')
    )
    .max(10, 'Cannot have more than 10 tags')
    .optional()
    .default([]),
});

export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3,   'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters')
    .optional(),

  subtitle: z
    .string()
    .max(200, 'Subtitle cannot exceed 200 characters')
    .nullable()
    .optional(),

  description: z
    .string()
    .min(20,   'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),

  category: z
    .enum(courseCategories, {
      message: `Category must be one of: ${courseCategories.join(', ')}`,
    })
    .optional(),

  level: z
    .enum(courseLevels, {
      message: `Level must be one of: ${courseLevels.join(', ')}`,
    })
    .optional(),

  language: z
    .string()
    .min(1, 'Language cannot be empty')
    .optional(),

  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .optional(),

  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code')
    .optional(),

  tags: z
    .array(z.string().max(30, 'Each tag cannot exceed 30 characters'))
    .max(10, 'Cannot have more than 10 tags')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// add after updateCourseSchema

export const addModuleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Module title must be at least 3 characters')
    .max(150, 'Module title cannot exceed 150 characters'),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .nullable()
    .optional(),
});

// add after updateCourseSchema

export const updateModuleSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Module title must be at least 3 characters')
      .max(150, 'Module title cannot exceed 150 characters')
      .optional(),

    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .nullable()
      .optional(),
  })
  .refine(
  (data) =>
    data.title !== undefined ||
    data.description !== undefined,
  { message: 'At least one field must be provided for update' }
);

// add after updateCourseSchema

export const reorderSchema = z.object({
  orderedIds: z
    .array(z.string())
    .min(1, 'orderedIds must contain at least one id'),
});

// add after reorderSchema

export const addLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Lesson title must be at least 3 characters')
    .max(150, 'Lesson title cannot exceed 150 characters'),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .nullable()
    .optional(),

  isPreview: z
    .boolean()
    .optional()
    .default(false),
});

export const updateLessonSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Lesson title must be at least 3 characters')
      .max(150, 'Lesson title cannot exceed 150 characters')
      .optional(),

    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .nullable()
      .optional(),

    isPreview: z
      .boolean()
      .optional(),
  })
  .refine(
  (data) =>
    data.title !== undefined ||
    data.description !== undefined ||
    data.isPreview !== undefined,
  { message: 'At least one field must be provided for update' }
)

//  Chapter Validators

export const addChapterSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .min(3, 'Chapter title must be at least 3 characters')
      .max(150, 'Chapter title cannot exceed 150 characters'),

    type: z.enum(['video', 'text'], {
      message: "Chapter type must be 'video' or 'text'",
    }),

    isFree: z
      .boolean()
      .optional()
      .default(false),

    // Only relevant for text chapters — validated at domain level too
    content: z
      .string()
      .max(50000, 'Content cannot exceed 50,000 characters')
      .nullable()
      .optional(),

    duration: z
      .number()
      .min(0, 'Duration cannot be negative')
      .optional(),
  })
  .refine(
    (data) => {
      // text chapters must have content
      if (data.type === 'text' && !data.content) {
        return false;
      }
      return true;
    },
    { message: 'Text chapters must include content', path: ['content'] }
  );

export const updateChapterSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Chapter title must be at least 3 characters')
      .max(150, 'Chapter title cannot exceed 150 characters')
      .optional(),

    isFree: z
      .boolean()
      .optional(),

    content: z
      .string()
      .max(50000, 'Content cannot exceed 50,000 characters')
      .nullable()
      .optional(),

    duration: z
      .number()
      .min(0, 'Duration cannot be negative')
      .optional(),
  })
  .refine(
    (data) =>
      data.title    !== undefined ||
      data.isFree   !== undefined ||
      data.content  !== undefined ||
      data.duration !== undefined,
    { message: 'At least one field must be provided for update' }
  );

  // Video Upload Validators

export const getVideoUploadUrlSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename cannot exceed 255 characters'),

  mimeType: z.enum(
    ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'],
    { message: 'Unsupported video mime type' }
  ),

  size: z
    .number()
    .int()
    .positive('File size must be positive')
    .max(2 * 1024 * 1024 * 1024, 'File size cannot exceed 2 GB'),
});

export const confirmVideoUploadSchema = z.object({
  duration: z
    .number()
    .positive('Duration must be greater than 0'),
});