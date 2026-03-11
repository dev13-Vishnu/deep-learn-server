import { RemoveLessonRequestDTO, RemoveLessonResponseDTO } from '../../../dto/course/Lesson.dto';
export interface IRemoveLessonUseCase {
  execute(dto: RemoveLessonRequestDTO): Promise<RemoveLessonResponseDTO>;
}