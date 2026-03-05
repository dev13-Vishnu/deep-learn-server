import { DomainError } from '../errors/DomainError';


export type CourseStatus   = 'draft' | 'published' | 'archived';
export type CourseLevel    = 'beginner' | 'intermediate' | 'advanced' | 'all';
export type CourseCategory = 'development' | 'design' | 'business' | 'marketing' | 'photography' | 'music' | 'health' | 'other';
export type ChapterType    = 'video' | 'text';
export type VideoStatus    = 'uploading' | 'ready' | 'failed';

// ─── Nested value types ───────────────────────────────────────────────────────

export interface VideoMetadata {
  s3Key:      string;
  url:        string;
  size:       number;
  mimeType:   string;
  duration:   number;
  status:     VideoStatus;
  uploadedAt: Date;
}

export interface Chapter {
  id:       string;
  title:    string;
  order:    number;
  type:     ChapterType;
  duration: number;
  isFree:   boolean;
  content:  string | null;
  video:    VideoMetadata | null;
}

export interface Lesson {
  id:          string;
  title:       string;
  description: string | null;
  order:       number;
  isPreview:   boolean;
  duration:    number;
  chapters:    Chapter[];
}

export interface Module {
  id:          string;
  title:       string;
  description: string | null;
  order:       number;
  duration:    number;
  lessons:     Lesson[];
}

// ─── Factory input types ──────────────────────────────────────────────────────

export interface CreateCourseData {
  id:           string;
  tutorId:      string;
  title:        string;
  subtitle?:    string | null;
  description:  string;
  category:     CourseCategory;
  level:        CourseLevel;
  language:     string;
  price?:       number;
  currency?:    string;
  tags?:        string[];
}

export interface ReconstructCourseData {
  id:              string;
  tutorId:         string;
  title:           string;
  subtitle:        string | null;
  description:     string;
  thumbnail:       string | null;
  category:        CourseCategory;
  level:           CourseLevel;
  language:        string;
  price:           number;
  currency:        string;
  tags:            string[];
  status:          CourseStatus;
  totalDuration:   number;
  enrollmentCount: number;
  modules:         Module[];
  publishedAt:     Date | null;
  createdAt:       Date;
  updatedAt:       Date;
}

// ─── State machine ────────────────────────────────────────────────────────────

const VALID_STATUS_TRANSITIONS: Record<CourseStatus, CourseStatus[]> = {
  draft:     ['published'],
  published: ['archived', 'draft'],
  archived:  ['draft'],
};

// ─── Course aggregate root ────────────────────────────────────────────────────

export class Course {
  private _status:      CourseStatus;
  private _thumbnail:   string | null;
  private _modules:     Module[];
  private _publishedAt: Date | null;
  private _totalDuration: number;

  private constructor(
    public readonly id:              string,
    public readonly tutorId:         string,
    private _title:                  string,
    private _subtitle:               string | null,
    private _description:            string,
    private _category:               CourseCategory,
    private _level:                  CourseLevel,
    private _language:               string,
    private _price:                  number,
    private _currency:               string,
    private _tags:                   string[],
    public readonly enrollmentCount: number,
    public readonly createdAt:       Date,
    public readonly updatedAt:       Date,
    status:          CourseStatus,
    thumbnail:       string | null,
    modules:         Module[],
    publishedAt:     Date | null,
    totalDuration:   number
  ) {
    this._status        = status;
    this._thumbnail     = thumbnail;
    this._modules       = modules;
    this._publishedAt   = publishedAt;
    this._totalDuration = totalDuration;
  }


  public static create(data: CreateCourseData): Course {
    Course.validateTitle(data.title);
    Course.validateDescription(data.description);

    if (data.price !== undefined && data.price < 0) {
      throw new DomainError('Price cannot be negative');
    }

    return new Course(
      data.id,
      data.tutorId,
      data.title.trim(),
      data.subtitle?.trim() ?? null,
      data.description.trim(),
      data.category,
      data.level,
      data.language.trim(),
      data.price    ?? 0,
      data.currency ?? 'USD',
      data.tags     ?? [],
      0,          // enrollmentCount
      new Date(), // createdAt
      new Date(), // updatedAt
      'draft',    // status
      null,       // thumbnail
      [],         // modules
      null,       // publishedAt
      0           // totalDuration
    );
  }

  public static reconstruct(data: ReconstructCourseData): Course {
    return new Course(
      data.id,
      data.tutorId,
      data.title,
      data.subtitle,
      data.description,
      data.category,
      data.level,
      data.language,
      data.price,
      data.currency,
      data.tags,
      data.enrollmentCount,
      data.createdAt,
      data.updatedAt,
      data.status,
      data.thumbnail,
      data.modules,
      data.publishedAt,
      data.totalDuration
    );
  }


  get title():         string           { return this._title; }
  get subtitle():      string | null    { return this._subtitle; }
  get description():   string           { return this._description; }
  get category():      CourseCategory   { return this._category; }
  get level():         CourseLevel      { return this._level; }
  get language():      string           { return this._language; }
  get price():         number           { return this._price; }
  get currency():      string           { return this._currency; }
  get tags():          string[]         { return [...this._tags]; }
  get status():        CourseStatus     { return this._status; }
  get thumbnail():     string | null    { return this._thumbnail; }
  get modules():       Module[]         { return this._modules; }
  get publishedAt():   Date | null      { return this._publishedAt; }
  get totalDuration(): number           { return this._totalDuration; }


  public updateBasicInfo(data: Partial<Omit<CreateCourseData, 'id' | 'tutorId'>>): void {
    if (data.title !== undefined) {
      Course.validateTitle(data.title);
      this._title = data.title.trim();
    }
    if (data.subtitle !== undefined) {
      this._subtitle = data.subtitle?.trim() ?? null;
    }
    if (data.description !== undefined) {
      Course.validateDescription(data.description);
      this._description = data.description.trim();
    }
    if (data.category  !== undefined) { this._category  = data.category; }
    if (data.level     !== undefined) { this._level     = data.level; }
    if (data.language  !== undefined) { this._language  = data.language.trim(); }
    if (data.price     !== undefined) {
      if (data.price < 0) throw new DomainError('Price cannot be negative');
      this._price = data.price;
    }
    if (data.currency  !== undefined) { this._currency  = data.currency; }
    if (data.tags      !== undefined) {
      if (data.tags.length > 10) throw new DomainError('Cannot have more than 10 tags');
      this._tags = data.tags;
    }
  }


  public setThumbnail(url: string): void {
    if (!Course.isValidUrl(url)) {
      throw new DomainError('Invalid thumbnail URL');
    }
    this._thumbnail = url;
  }


  public publish(): void {
    this.assertTransition('published');
    const errors = this.validateForPublishing();
    if (errors.length > 0) {
      throw new DomainError(`Course cannot be published:\n${errors.map(e => `• ${e}`).join('\n')}`);
    }
    this._status      = 'published';
    this._publishedAt = new Date();
  }

  public unpublish(): void {
    this.assertTransition('draft');
    this._status = 'draft';
  }

  public archive(): void {
    this.assertTransition('archived');
    this._status = 'archived';
  }

  public reactivate(): void {
    this.assertTransition('draft');
    this._status = 'draft';
  }


  public addModule(data: { id: string; title: string; description?: string | null }): Module {
    Course.validateModuleTitle(data.title);
    const module: Module = {
      id:          data.id,
      title:       data.title.trim(),
      description: data.description?.trim() ?? null,
      order:       this._modules.length,
      duration:    0,
      lessons:     [],
    };
    this._modules.push(module);
    return module;
  }

  public updateModule(moduleId: string, data: { title?: string; description?: string | null }): void {
    const module = this.findModule(moduleId);
    if (data.title !== undefined) {
      Course.validateModuleTitle(data.title);
      module.title = data.title.trim();
    }
    if (data.description !== undefined) {
      module.description = data.description?.trim() ?? null;
    }
  }

  public removeModule(moduleId: string): void {
    const index = this._modules.findIndex(m => m.id === moduleId);
    if (index === -1) throw new DomainError(`Module ${moduleId} not found`);
    this._modules.splice(index, 1);
    this._modules.forEach((m, i) => { m.order = i; });
    this.recalculateDurations();
  }

  public reorderModules(orderedIds: string[]): void {
    if (orderedIds.length !== this._modules.length) {
      throw new DomainError('Ordered IDs must include every module exactly once');
    }
    const map = new Map(this._modules.map(m => [m.id, m]));
    orderedIds.forEach(id => {
      if (!map.has(id)) throw new DomainError(`Module ${id} not found`);
    });
    this._modules = orderedIds.map((id, index) => {
      const m = map.get(id)!;
      m.order = index;
      return m;
    });
  }


  public addLesson(moduleId: string, data: { id: string; title: string; description?: string | null; isPreview?: boolean }): Lesson {
    const module = this.findModule(moduleId);
    Course.validateLessonTitle(data.title);
    const lesson: Lesson = {
      id:          data.id,
      title:       data.title.trim(),
      description: data.description?.trim() ?? null,
      order:       module.lessons.length,
      isPreview:   data.isPreview ?? false,
      duration:    0,
      chapters:    [],
    };
    module.lessons.push(lesson);
    return lesson;
  }

  public updateLesson(moduleId: string, lessonId: string, data: { title?: string; description?: string | null; isPreview?: boolean }): void {
    const lesson = this.findLesson(moduleId, lessonId);
    if (data.title !== undefined) {
      Course.validateLessonTitle(data.title);
      lesson.title = data.title.trim();
    }
    if (data.description !== undefined) { lesson.description = data.description?.trim() ?? null; }
    if (data.isPreview   !== undefined) { lesson.isPreview   = data.isPreview; }
  }

  public removeLesson(moduleId: string, lessonId: string): void {
    const module = this.findModule(moduleId);
    const index  = module.lessons.findIndex(l => l.id === lessonId);
    if (index === -1) throw new DomainError(`Lesson ${lessonId} not found`);
    module.lessons.splice(index, 1);
    module.lessons.forEach((l, i) => { l.order = i; });
    this.recalculateDurations();
  }

  public reorderLessons(moduleId: string, orderedIds: string[]): void {
    const module = this.findModule(moduleId);
    if (orderedIds.length !== module.lessons.length) {
      throw new DomainError('Ordered IDs must include every lesson exactly once');
    }
    const map = new Map(module.lessons.map(l => [l.id, l]));
    orderedIds.forEach(id => {
      if (!map.has(id)) throw new DomainError(`Lesson ${id} not found`);
    });
    module.lessons = orderedIds.map((id, index) => {
      const l = map.get(id)!;
      l.order = index;
      return l;
    });
  }


  public addChapter(moduleId: string, lessonId: string, data: { id: string; title: string; type: ChapterType; isFree?: boolean; content?: string | null; duration?: number }): Chapter {
    const lesson = this.findLesson(moduleId, lessonId);
    Course.validateChapterTitle(data.title);
    if (data.type === 'text' && !data.content) {
      throw new DomainError('Text chapters must have content');
    }
    const chapter: Chapter = {
      id:       data.id,
      title:    data.title.trim(),
      order:    lesson.chapters.length,
      type:     data.type,
      duration: data.duration ?? 0,
      isFree:   data.isFree ?? false,
      content:  data.type === 'text' ? (data.content ?? null) : null,
      video:    null,
    };
    lesson.chapters.push(chapter);
    this.recalculateDurations();
    return chapter;
  }

  public updateChapter(moduleId: string, lessonId: string, chapterId: string, data: { title?: string; isFree?: boolean; content?: string | null; duration?: number }): void {
    const chapter = this.findChapter(moduleId, lessonId, chapterId);
    if (data.title    !== undefined) {
      Course.validateChapterTitle(data.title);
      chapter.title = data.title.trim();
    }
    if (data.isFree   !== undefined) { chapter.isFree   = data.isFree; }
    if (data.content  !== undefined) { chapter.content  = data.content ?? null; }
    if (data.duration !== undefined) {
      chapter.duration = data.duration;
      this.recalculateDurations();
    }
  }

  public removeChapter(moduleId: string, lessonId: string, chapterId: string): void {
    const lesson = this.findLesson(moduleId, lessonId);
    const index  = lesson.chapters.findIndex(c => c.id === chapterId);
    if (index === -1) throw new DomainError(`Chapter ${chapterId} not found`);
    lesson.chapters.splice(index, 1);
    lesson.chapters.forEach((c, i) => { c.order = i; });
    this.recalculateDurations();
  }

  public reorderChapters(moduleId: string, lessonId: string, orderedIds: string[]): void {
    const lesson = this.findLesson(moduleId, lessonId);
    if (orderedIds.length !== lesson.chapters.length) {
      throw new DomainError('Ordered IDs must include every chapter exactly once');
    }
    const map = new Map(lesson.chapters.map(c => [c.id, c]));
    orderedIds.forEach(id => {
      if (!map.has(id)) throw new DomainError(`Chapter ${id} not found`);
    });
    lesson.chapters = orderedIds.map((id, index) => {
      const c = map.get(id)!;
      c.order = index;
      return c;
    });
  }


  public attachVideo(moduleId: string, lessonId: string, chapterId: string, metadata: VideoMetadata): void {
    const chapter = this.findChapter(moduleId, lessonId, chapterId);
    if (chapter.type !== 'video') {
      throw new DomainError('Cannot attach video to a non-video chapter');
    }
    chapter.video = metadata;
  }

  public confirmVideo(moduleId: string, lessonId: string, chapterId: string, duration: number): void {
    const chapter = this.findChapter(moduleId, lessonId, chapterId);
    if (!chapter.video) {
      throw new DomainError('No video is attached to this chapter');
    }
    chapter.video.status   = 'ready';
    chapter.video.duration = duration;
    chapter.duration       = duration;
    this.recalculateDurations();
  }


  private assertTransition(target: CourseStatus): void {
    const allowed = VALID_STATUS_TRANSITIONS[this._status];
    if (!allowed.includes(target)) {
      throw new DomainError(`Cannot transition course status from '${this._status}' to '${target}'`);
    }
  }

  private validateForPublishing(): string[] {
    const errors: string[] = [];

    if (!this._title || this._title.length < 3)        errors.push('Title must be at least 3 characters');
    if (!this._description || this._description.length < 20) errors.push('Description must be at least 20 characters');
    if (!this._thumbnail)                               errors.push('Thumbnail image is required');
    if (this._modules.length === 0)                    errors.push('Course must have at least one module');

    for (const module of this._modules) {
      if (module.lessons.length === 0) {
        errors.push(`Module "${module.title}" must have at least one lesson`);
        continue;
      }
      for (const lesson of module.lessons) {
        if (lesson.chapters.length === 0) {
          errors.push(`Lesson "${lesson.title}" in module "${module.title}" must have at least one chapter`);
          continue;
        }
        for (const chapter of lesson.chapters) {
          if (chapter.type === 'video' && (!chapter.video || chapter.video.status !== 'ready')) {
            errors.push(`Chapter "${chapter.title}" has a video that is not ready`);
          }
        }
      }
    }

    return errors;
  }

  private recalculateDurations(): void {
    for (const module of this._modules) {
      for (const lesson of module.lessons) {
        lesson.duration = lesson.chapters.reduce((sum, c) => sum + c.duration, 0);
      }
      module.duration = module.lessons.reduce((sum, l) => sum + l.duration, 0);
    }
    this._totalDuration = this._modules.reduce((sum, m) => sum + m.duration, 0);
  }

  private findModule(moduleId: string): Module {
    const module = this._modules.find(m => m.id === moduleId);
    if (!module) throw new DomainError(`Module ${moduleId} not found`);
    return module;
  }

  private findLesson(moduleId: string, lessonId: string): Lesson {
    const module = this.findModule(moduleId);
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (!lesson) throw new DomainError(`Lesson ${lessonId} not found`);
    return lesson;
  }

  private findChapter(moduleId: string, lessonId: string, chapterId: string): Chapter {
    const lesson  = this.findLesson(moduleId, lessonId);
    const chapter = lesson.chapters.find(c => c.id === chapterId);
    if (!chapter) throw new DomainError(`Chapter ${chapterId} not found`);
    return chapter;
  }


  private static validateTitle(title: string): void {
    if (!title || title.trim().length < 3)    throw new DomainError('Title must be at least 3 characters');
    if (title.trim().length > 120)            throw new DomainError('Title cannot exceed 120 characters');
  }

  private static validateDescription(description: string): void {
    if (!description || description.trim().length < 20)  throw new DomainError('Description must be at least 20 characters');
    if (description.trim().length > 5000)                throw new DomainError('Description cannot exceed 5000 characters');
  }

  private static validateModuleTitle(title: string): void {
    if (!title || title.trim().length < 3)  throw new DomainError('Module title must be at least 3 characters');
    if (title.trim().length > 150)          throw new DomainError('Module title cannot exceed 150 characters');
  }

  private static validateLessonTitle(title: string): void {
    if (!title || title.trim().length < 3)  throw new DomainError('Lesson title must be at least 3 characters');
    if (title.trim().length > 150)          throw new DomainError('Lesson title cannot exceed 150 characters');
  }

  private static validateChapterTitle(title: string): void {
    if (!title || title.trim().length < 3)  throw new DomainError('Chapter title must be at least 3 characters');
    if (title.trim().length > 150)          throw new DomainError('Chapter title cannot exceed 150 characters');
  }

  private static isValidUrl(url: string): boolean {
    try { new URL(url); return true; } catch { return false; }
  }
}