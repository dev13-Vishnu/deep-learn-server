import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CreateCourseUseCase } from '../../application/course/CreateCourseUseCase';
import { UpdateCourseUseCase } from '../../application/course/UpdateCourseUseCase';
import { ListTutorCoursesUseCase } from '../../application/course/ListTutorCoursesUseCase';
import { GetTutorCourseUseCase } from '../../application/course/GetTutorCourseUseCase';
import { DeleteCourseUseCase } from '../../application/course/DeleteCourseUseCase';
import { UploadThumbnailUseCase } from '../../application/course/UploadThumbnailUseCase';
import { PublishCourseUseCase } from '../../application/course/PublishCourseUseCase';
import { UnpublishCourseUseCase } from '../../application/course/UnpublishCourseUseCase';
import { ArchiveCourseUseCase } from '../../application/course/ArchiveCourseUseCase';
import { AddModuleUseCase } from '../../application/course/AddModuleUseCase';
import { UpdateModuleUseCase } from '../../application/course/UpdateModuleUseCase';
import { RemoveModuleUseCase } from '../../application/course/RemoveModuleUseCase';
import { ReorderModulesUseCase } from '../../application/course/ReorderModulesUseCase';
import { AddLessonUseCase } from '../../application/course/AddLessonUseCase';
import { UpdateLessonUseCase } from '../../application/course/UpdateLessonUseCase';
import { RemoveLessonUseCase } from '../../application/course/RemoveLessonUseCase';
import { ReorderLessonsUseCase } from '../../application/course/ReorderLessonsUseCase';
import { AddChapterUseCase } from '../../application/course/AddChapterUseCase';
import { UpdateChapterUseCase } from '../../application/course/UpdateChapterUseCase';
import { RemoveChapterUseCase } from '../../application/course/RemoveChapterUseCase';
import { ReorderChaptersUseCase } from '../../application/course/ReorderChaptersUseCase';
import { GetVideoUploadUrlUseCase } from '../../application/course/GetVideoUploadUrlUseCase';
import { ConfirmVideoUploadUseCase } from '../../application/course/ConfirmVideoUploadUseCase';
import { ListPublicCoursesUseCase } from '../../application/course/ListPublicCoursesUseCase';
import { GetPublicCourseUseCase } from '../../application/course/GetPublicCourseUseCase';
import { UploadableFile } from '../../application/dto/shared/UploadableFile.dto';
import { CourseCategory, CourseLevel, CourseStatus } from '../../domain/entities/Course';
import { PublicCourseSort } from '../../application/ports/CourseRepositoryPort';

@injectable()
export class CourseController {
  constructor(
    @inject(TYPES.CreateCourseUseCase)      private readonly createCourseUseCase: CreateCourseUseCase,
    @inject(TYPES.UpdateCourseUseCase)      private readonly updateCourseUseCase: UpdateCourseUseCase,
    @inject(TYPES.ListTutorCoursesUseCase)  private readonly listTutorCoursesUseCase: ListTutorCoursesUseCase,
    @inject(TYPES.GetTutorCourseUseCase)    private readonly getTutorCourseUseCase: GetTutorCourseUseCase,
    @inject(TYPES.DeleteCourseUseCase)      private readonly deleteCourseUseCase: DeleteCourseUseCase,
    @inject(TYPES.UploadThumbnailUseCase)   private readonly uploadThumbnailUseCase: UploadThumbnailUseCase,
    @inject(TYPES.PublishCourseUseCase)     private readonly publishCourseUseCase: PublishCourseUseCase,
    @inject(TYPES.UnpublishCourseUseCase)   private readonly unpublishCourseUseCase: UnpublishCourseUseCase,
    @inject(TYPES.ArchiveCourseUseCase)     private readonly archiveCourseUseCase: ArchiveCourseUseCase,
    @inject(TYPES.AddModuleUseCase)         private readonly addModuleUseCase: AddModuleUseCase,
    @inject(TYPES.UpdateModuleUseCase)      private readonly updateModuleUseCase: UpdateModuleUseCase,
    @inject(TYPES.RemoveModuleUseCase)      private readonly removeModuleUseCase: RemoveModuleUseCase,
    @inject(TYPES.ReorderModulesUseCase)    private readonly reorderModulesUseCase: ReorderModulesUseCase,
    @inject(TYPES.AddLessonUseCase)         private readonly addLessonUseCase: AddLessonUseCase,
    @inject(TYPES.UpdateLessonUseCase)      private readonly updateLessonUseCase: UpdateLessonUseCase,
    @inject(TYPES.RemoveLessonUseCase)      private readonly removeLessonUseCase: RemoveLessonUseCase,
    @inject(TYPES.ReorderLessonsUseCase)    private readonly reorderLessonsUseCase: ReorderLessonsUseCase,
    @inject(TYPES.AddChapterUseCase)        private readonly addChapterUseCase: AddChapterUseCase,
    @inject(TYPES.UpdateChapterUseCase)     private readonly updateChapterUseCase: UpdateChapterUseCase,
    @inject(TYPES.RemoveChapterUseCase)     private readonly removeChapterUseCase: RemoveChapterUseCase,
    @inject(TYPES.ReorderChaptersUseCase)   private readonly reorderChaptersUseCase: ReorderChaptersUseCase,
    @inject(TYPES.GetVideoUploadUrlUseCase)  private readonly getVideoUploadUrlUseCase: GetVideoUploadUrlUseCase,
    @inject(TYPES.ConfirmVideoUploadUseCase) private readonly confirmVideoUploadUseCase: ConfirmVideoUploadUseCase,
    @inject(TYPES.ListPublicCoursesUseCase)  private readonly listPublicCoursesUseCase: ListPublicCoursesUseCase,
    @inject(TYPES.GetPublicCourseUseCase)    private readonly getPublicCourseUseCase: GetPublicCourseUseCase,
  ) {}

  async createCourse(tutorId: string, body: { title: string; subtitle?: string | null; description: string; category: CourseCategory; level: CourseLevel; language: string; price?: number; currency?: string; tags?: string[];
  }) {
    return this.createCourseUseCase.execute({ tutorId, ...body });
  }

  async updateCourse(courseId: string, tutorId: string, body: { title?: string; subtitle?: string | null; description?: string; category?: CourseCategory; level?: CourseLevel; language?: string; price?: number; currency?: string; tags?: string[];
  }) {
    return this.updateCourseUseCase.execute({ courseId, tutorId, ...body });
  }

  async getMyCourses(tutorId: string, query: { page?: number; limit?: number; status?: CourseStatus;
  }) {
    return this.listTutorCoursesUseCase.execute({ tutorId, ...query });
  }

  async getMyCourse(courseId: string, tutorId: string) {
    return this.getTutorCourseUseCase.execute({ courseId, tutorId });
  }

  async getPublicCourses(params: { page?: number; limit?: number; filter: { category?: CourseCategory; level?: CourseLevel; language?: string; minPrice?: number; maxPrice?: number; search?: string; sort?: PublicCourseSort;
    };
  }) {
    return this.listPublicCoursesUseCase.execute(params);
  }

  async getPublicCourse(courseId: string) {
    return this.getPublicCourseUseCase.execute({ courseId });
  }

  async deleteCourse(courseId: string, tutorId: string) {
    return this.deleteCourseUseCase.execute({ courseId, tutorId });
  }

  async uploadThumbnail(courseId: string, tutorId: string, file: UploadableFile) {
    return this.uploadThumbnailUseCase.execute({ courseId, tutorId, file });
  }

  async publishCourse(courseId: string, tutorId: string) {
    return this.publishCourseUseCase.execute({ courseId, tutorId });
  }

  async unpublishCourse(courseId: string, tutorId: string) {
    return this.unpublishCourseUseCase.execute({ courseId, tutorId });
  }

  async archiveCourse(courseId: string, tutorId: string) {
    return this.archiveCourseUseCase.execute({ courseId, tutorId });
  }

  async addModule(courseId: string, tutorId: string, body: { title: string; description?: string | null }) {
    return this.addModuleUseCase.execute({ courseId, tutorId, ...body });
  }

  async updateModule(courseId: string, tutorId: string, moduleId: string, body: { title?: string; description?: string | null }) {
    return this.updateModuleUseCase.execute({ courseId, tutorId, moduleId, ...body });
  }

  async removeModule(courseId: string, tutorId: string, moduleId: string) {
    return this.removeModuleUseCase.execute({ courseId, tutorId, moduleId });
  }

  async reorderModules(courseId: string, tutorId: string, orderedIds: string[]) {
    return this.reorderModulesUseCase.execute({ courseId, tutorId, orderedIds });
  }

  async addLesson(courseId: string, tutorId: string, moduleId: string, body: { title: string; description?: string | null; isPreview?: boolean }) {
    return this.addLessonUseCase.execute({ courseId, tutorId, moduleId, ...body });
  }

  async updateLesson(courseId: string, tutorId: string, moduleId: string, lessonId: string, body: { title?: string; description?: string | null; isPreview?: boolean }) {
    return this.updateLessonUseCase.execute({ courseId, tutorId, moduleId, lessonId, ...body });
  }

  async removeLesson(courseId: string, tutorId: string, moduleId: string, lessonId: string) {
    return this.removeLessonUseCase.execute({ courseId, tutorId, moduleId, lessonId });
  }

  async reorderLessons(courseId: string, tutorId: string, moduleId: string, orderedIds: string[]) {
    return this.reorderLessonsUseCase.execute({ courseId, tutorId, moduleId, orderedIds });
  }

  async addChapter(courseId: string, tutorId: string, moduleId: string, lessonId: string, body: { title: string; type: 'video' | 'text'; isFree?: boolean; content?: string | null; duration?: number }) {
    return this.addChapterUseCase.execute({ courseId, tutorId, moduleId, lessonId, ...body });
  }

  async updateChapter(courseId: string, tutorId: string, moduleId: string, lessonId: string, chapterId: string, body: { title?: string; isFree?: boolean; content?: string | null; duration?: number }) {
    return this.updateChapterUseCase.execute({ courseId, tutorId, moduleId, lessonId, chapterId, ...body });
  }

  async removeChapter(courseId: string, tutorId: string, moduleId: string, lessonId: string, chapterId: string) {
    return this.removeChapterUseCase.execute({ courseId, tutorId, moduleId, lessonId, chapterId });
  }

  async reorderChapters(courseId: string, tutorId: string, moduleId: string, lessonId: string, orderedIds: string[]) {
    return this.reorderChaptersUseCase.execute({ courseId, tutorId, moduleId, lessonId, orderedIds });
  }

  async getVideoUploadUrl(courseId: string, tutorId: string, moduleId: string, lessonId: string, chapterId: string, body: { filename: string; mimeType: string; size: number }) {
    return this.getVideoUploadUrlUseCase.execute({ courseId, tutorId, moduleId, lessonId, chapterId, ...body });
  }

  async confirmVideoUpload(courseId: string, tutorId: string, moduleId: string, lessonId: string, chapterId: string, body: { duration: number }) {
    return this.confirmVideoUploadUseCase.execute({ courseId, tutorId, moduleId, lessonId, chapterId, ...body });
  }
}