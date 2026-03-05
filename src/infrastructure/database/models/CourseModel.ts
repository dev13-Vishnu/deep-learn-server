import { Schema, model, Document, Types } from 'mongoose';


export interface IVideoMetadata {
  s3Key: string;
  url: string;
  size: number;
  mimeType: string;
  duration: number;
  status: 'uploading' | 'ready' | 'failed';
  uploadedAt: Date;
}

export interface IChapterDocument {
  id: string;
  title: string;
  order: number;
  type: 'video' | 'text';
  duration: number;
  isFree: boolean;
  content: string | null;
  video: IVideoMetadata | null;
}

export interface ILessonDocument {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isPreview: boolean;
  duration: number;
  chapters: IChapterDocument[];
}

export interface IModuleDocument {
  id: string;
  title: string;
  description: string | null;
  order: number;
  duration: number;
  lessons: ILessonDocument[];
}


export interface ICourseDocument extends Document {
  tutorId: Types.ObjectId;
  title: string;
  subtitle: string | null;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  language: string;
  price: number;
  currency: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  totalDuration: number;
  enrollmentCount: number;
  modules: IModuleDocument[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}


const videoMetadataSchema = new Schema<IVideoMetadata>(
  {
    s3Key:      { type: String, required: true },
    url:        { type: String, required: true },
    size:       { type: Number, required: true },
    mimeType:   { type: String, required: true },
    duration:   { type: Number, default: 0 },
    status:     { type: String, enum: ['uploading', 'ready', 'failed'], default: 'uploading' },
    uploadedAt: { type: Date, required: true },
  },
  { _id: false }
);

const chapterSchema = new Schema<IChapterDocument>(
  {
    id:       { type: String, required: true },
    title:    { type: String, required: true },
    order:    { type: Number, required: true, default: 0 },
    type:     { type: String, enum: ['video', 'text'], required: true },
    duration: { type: Number, default: 0 },
    isFree:   { type: Boolean, default: false },
    content:  { type: String, default: null },
    video:    { type: videoMetadataSchema, default: null },
  },
  { _id: false }
);

const lessonSchema = new Schema<ILessonDocument>(
  {
    id:          { type: String, required: true },
    title:       { type: String, required: true },
    description: { type: String, default: null },
    order:       { type: Number, required: true, default: 0 },
    isPreview:   { type: Boolean, default: false },
    duration:    { type: Number, default: 0 },
    chapters:    { type: [chapterSchema], default: [] },
  },
  { _id: false }
);

const moduleSchema = new Schema<IModuleDocument>(
  {
    id:          { type: String, required: true },
    title:       { type: String, required: true },
    description: { type: String, default: null },
    order:       { type: Number, required: true, default: 0 },
    duration:    { type: Number, default: 0 },
    lessons:     { type: [lessonSchema], default: [] },
  },
  { _id: false }
);


const courseSchema = new Schema<ICourseDocument>(
  {
    tutorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title:       { type: String, required: true },
    subtitle:    { type: String, default: null },
    description: { type: String, required: true },
    thumbnail:   { type: String, default: null },

    category: {
      type: String,
      enum: ['development', 'design', 'business', 'marketing', 'photography', 'music', 'health', 'other'],
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      required: true,
    },
    language: { type: String, required: true },

    price:    { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    tags:     { type: [String], default: [] },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },

    totalDuration:   { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },

    modules:     { type: [moduleSchema], default: [] },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);


courseSchema.index({ tutorId: 1, status: 1 });
courseSchema.index({ status: 1, category: 1, level: 1, createdAt: -1 });
courseSchema.index({ status: 1, title: 'text', description: 'text' });
courseSchema.index({ tutorId: 1, createdAt: -1 });


export const CourseModel = model<ICourseDocument>('Course', courseSchema);