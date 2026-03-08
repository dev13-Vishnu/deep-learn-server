import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { ICreateCourseUseCase }       from '../../application/ports/inbound/course/ICreateCourseUseCase';
import { IUpdateCourseUseCase }       from '../../application/ports/inbound/course/IUpdateCourseUseCase';
import { IListTutorCoursesUseCase }   from '../../application/ports/inbound/course/IListTutorCoursesUseCase';
import { IGetTutorCourseUseCase }     from '../../application/ports/inbound/course/IGetTutorCourseUseCase';
import { IDeleteCourseUseCase }       from '../../application/ports/inbound/course/IDeleteCourseUseCase';
import { IUploadThumbnailUseCase }    from '../../application/ports/inbound/course/IUploadThumbnailUseCase';
import { IPublishCourseUseCase }      from '../../application/ports/inbound/course/IPublishCourseUseCase';
import { IUnpublishCourseUseCase }    from '../../application/ports/inbound/course/IUnpublishCourseUseCase';
import { IArchiveCourseUseCase }      from '../../application/ports/inbound/course/IArchiveCourseUseCase';
import { IAddModuleUseCase }          from '../../application/ports/inbound/course/IAddModuleUseCase';
import { IUpdateModuleUseCase }       from '../../application/ports/inbound/course/IUpdateModuleUseCase';
import { IRemoveModuleUseCase }       from '../../application/ports/inbound/course/IRemoveModuleUseCase';
import { IReorderModulesUseCase }     from '../../application/ports/inbound/course/IReorderModulesUseCase';
import { IAddLessonUseCase }          from '../../application/ports/inbound/course/IAddLessonUseCase';
import { IUpdateLessonUseCase }       from '../../application/ports/inbound/course/IUpdateLessonUseCase';
import { IRemoveLessonUseCase }       from '../../application/ports/inbound/course/IRemoveLessonUseCase';
import { IReorderLessonsUseCase }     from '../../application/ports/inbound/course/IReorderLessonsUseCase';
import { IAddChapterUseCase }         from '../../application/ports/inbound/course/IAddChapterUseCase';
import { IUpdateChapterUseCase }      from '../../application/ports/inbound/course/IUpdateChapterUseCase';
import { IRemoveChapterUseCase }      from '../../application/ports/inbound/course/IRemoveChapterUseCase';
import { IReorderChaptersUseCase }    from '../../application/ports/inbound/course/IReorderChaptersUseCase';
import { IGetVideoUploadUrlUseCase }  from '../../application/ports/inbound/course/IGetVideoUploadUrlUseCase';
import { IConfirmVideoUploadUseCase } from '../../application/ports/inbound/course/IConfirmVideoUploadUseCase';
import { IListPublicCoursesUseCase }  from '../../application/ports/inbound/course/IListPublicCoursesUseCase';
import { IGetPublicCourseUseCase }    from '../../application/ports/inbound/course/IGetPublicCourseUseCase';
import { UploadableFile } from '../../application/dto/shared/UploadableFile.dto';
import { CourseCategory, CourseLevel, CourseStatus } from '../../domain/entities/Course';
import { PublicCourseSort } from '../../application/ports/CourseRepositoryPort';

@injectable()
export class CourseController {
  constructor(
    @inject(TYPES.CreateCourseUseCase)      private readonly createCourseUseCase:      ICreateCourseUseCase,
    @inject(TYPES.UpdateCourseUseCase)      private readonly updateCourseUseCase:      IUpdateCourseUseCase,
    @inject(TYPES.ListTutorCoursesUseCase)  private readonly listTutorCoursesUseCase:  IListTutorCoursesUseCase,
    @inject(TYPES.GetTutorCourseUseCase)    private readonly getTutorCourseUseCase:    IGetTutorCourseUseCase,
    @inject(TYPES.DeleteCourseUseCase)      private readonly deleteCourseUseCase:      IDeleteCourseUseCase,
    @inject(TYPES.UploadThumbnailUseCase)   private readonly uploadThumbnailUseCase:   IUploadThumbnailUseCase,
    @inject(TYPES.PublishCourseUseCase)     private readonly publishCourseUseCase:     IPublishCourseUseCase,
    @inject(TYPES.UnpublishCourseUseCase)   private readonly unpublishCourseUseCase:   IUnpublishCourseUseCase,
    @inject(TYPES.ArchiveCourseUseCase)     private readonly archiveCourseUseCase:     IArchiveCourseUseCase,
    @inject(TYPES.AddModuleUseCase)         private readonly addModuleUseCase:         IAddModuleUseCase,
    @inject(TYPES.UpdateModuleUseCase)      private readonly updateModuleUseCase:      IUpdateModuleUseCase,
    @inject(TYPES.RemoveModuleUseCase)      private readonly removeModuleUseCase:      IRemoveModuleUseCase,
    @inject(TYPES.ReorderModulesUseCase)    private readonly reorderModulesUseCase:    IReorderModulesUseCase,
    @inject(TYPES.AddLessonUseCase)         private readonly addLessonUseCase:         IAddLessonUseCase,
    @inject(TYPES.UpdateLessonUseCase)      private readonly updateLessonUseCase:      IUpdateLessonUseCase,
    @inject(TYPES.RemoveLessonUseCase)      private readonly removeLessonUseCase:      IRemoveLessonUseCase,
    @inject(TYPES.ReorderLessonsUseCase)    private readonly reorderLessonsUseCase:    IReorderLessonsUseCase,
    @inject(TYPES.AddChapterUseCase)        private readonly addChapterUseCase:        IAddChapterUseCase,
    @inject(TYPES.UpdateChapterUseCase)     private readonly updateChapterUseCase:     IUpdateChapterUseCase,
    @inject(TYPES.RemoveChapterUseCase)     private readonly removeChapterUseCase:     IRemoveChapterUseCase,
    @inject(TYPES.ReorderChaptersUseCase)   private readonly reorderChaptersUseCase:   IReorderChaptersUseCase,
    @inject(TYPES.GetVideoUploadUrlUseCase)  private readonly getVideoUploadUrlUseCase:  IGetVideoUploadUrlUseCase,
    @inject(TYPES.ConfirmVideoUploadUseCase) private readonly confirmVideoUploadUseCase: IConfirmVideoUploadUseCase,
    @inject(TYPES.ListPublicCoursesUseCase)  private readonly listPublicCoursesUseCase:  IListPublicCoursesUseCase,
    @inject(TYPES.GetPublicCourseUseCase)    private readonly getPublicCourseUseCase:    IGetPublicCourseUseCase,
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