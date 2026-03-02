import { ModuleDTO } from './CourseData.dto';

export interface AddModuleRequestDTO {
  courseId:     string;
  tutorId:      string;
  title:        string;
  description?: string | null;
}

export interface AddModuleResponseDTO {
  message: string;
  module:  ModuleDTO;
  course:  { totalDuration: number };
}

export interface UpdateModuleRequestDTO {
  courseId:     string;
  tutorId:      string;
  moduleId:     string;
  title?:       string;
  description?: string | null;
}

export interface UpdateModuleResponseDTO {
  message: string;
  module:  ModuleDTO;
}

export interface RemoveModuleRequestDTO {
  courseId: string;
  tutorId:  string;
  moduleId: string;
}

export interface RemoveModuleResponseDTO {
  message: string;
}

export interface ReorderModulesRequestDTO {
  courseId:   string;
  tutorId:    string;
  orderedIds: string[];
}

export interface ReorderModulesResponseDTO {
  message: string;
  modules: { id: string; order: number }[];
}