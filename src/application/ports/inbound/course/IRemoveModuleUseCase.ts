import { RemoveModuleRequestDTO, RemoveModuleResponseDTO } from '../../../dto/course/Module.dto';
export interface IRemoveModuleUseCase {
  execute(dto: RemoveModuleRequestDTO): Promise<RemoveModuleResponseDTO>;
}