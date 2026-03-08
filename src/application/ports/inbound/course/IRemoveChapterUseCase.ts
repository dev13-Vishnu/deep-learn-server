import { RemoveChapterRequestDTO, RemoveChapterResponseDTO } from '../../../dto/course/Chapter.dto';
export interface IRemoveChapterUseCase {
  execute(dto: RemoveChapterRequestDTO): Promise<RemoveChapterResponseDTO>;
}