import type { Variable } from "../entities/variable.js";

export interface VariableRepository {
  findById(id: string): Promise<Variable | null>;
  findByKey(workspaceId: string, key: string): Promise<Variable | null>;
  findByWorkspace(workspaceId: string): Promise<Variable[]>;
  create(variable: Variable): Promise<Variable>;
  update(variable: Variable): Promise<Variable>;
  delete(id: string): Promise<void>;
  search(workspaceId: string, query: string): Promise<Variable[]>;
}
