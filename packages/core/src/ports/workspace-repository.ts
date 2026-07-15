import type { Workspace } from "../entities/workspace.js";

export interface WorkspaceRepository {
  findById(id: string): Promise<Workspace | null>;
  findByOrganization(orgId: string): Promise<Workspace[]>;
  create(workspace: Workspace): Promise<Workspace>;
  update(workspace: Workspace): Promise<Workspace>;
  delete(id: string): Promise<void>;
}
