import { ReorderChaptersRequestDTO, ReorderChaptersResponseDTO } from '../../../dto/course/Chapter.dto';
export interface IReorderChaptersUseCase {
  execute(dto: ReorderChaptersRequestDTO): Promise<ReorderChaptersResponseDTO>;
}