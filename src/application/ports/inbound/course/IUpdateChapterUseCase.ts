import { UpdateChapterRequestDTO, UpdateChapterResponseDTO } from '../../../dto/course/Chapter.dto';
export interface IUpdateChapterUseCase {
  execute(dto: UpdateChapterRequestDTO): Promise<UpdateChapterResponseDTO>;
}