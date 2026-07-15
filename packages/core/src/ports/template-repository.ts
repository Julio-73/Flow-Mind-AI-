import type { Template } from "../entities/template.js";
import type { PaginatedResult, PaginationParams } from "@flowmind/shared";

export interface TemplateRepository {
  findById(id: string): Promise<Template | null>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Template>>;
  findByCategory(category: string, params: PaginationParams): Promise<PaginatedResult<Template>>;
  search(query: string, params: PaginationParams): Promise<PaginatedResult<Template>>;
  create(template: Template): Promise<Template>;
  update(template: Template): Promise<Template>;
  delete(id: string): Promise<void>;
}
