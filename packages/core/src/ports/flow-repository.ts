import type { Flow } from "../entities/flow.js";
import type { PaginatedResult, PaginationParams } from "@flowmind/shared";

export interface FlowRepository {
  findById(id: string): Promise<Flow | null>;
  findByWorkspace(workspaceId: string, params: PaginationParams): Promise<PaginatedResult<Flow>>;
  findByOrganization(orgId: string, params: PaginationParams): Promise<PaginatedResult<Flow>>;
  findActiveByTrigger(triggerType: string): Promise<Flow[]>;
  create(flow: Flow): Promise<Flow>;
  update(flow: Flow): Promise<Flow>;
  delete(id: string): Promise<void>;
  countByWorkspace(workspaceId: string): Promise<number>;
}
