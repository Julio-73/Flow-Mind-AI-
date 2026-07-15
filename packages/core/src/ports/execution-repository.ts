import type { Execution } from "../entities/execution.js";
import type { PaginatedResult, PaginationParams } from "@flowmind/shared";
import type { ExecutionStatus } from "../value-objects/execution-status.js";

export interface ExecutionRepository {
  findById(id: string): Promise<Execution | null>;
  findByFlow(flowId: string, params: PaginationParams): Promise<PaginatedResult<Execution>>;
  findByOrganization(orgId: string, params: PaginationParams): Promise<PaginatedResult<Execution>>;
  findRunning(): Promise<Execution[]>;
  findByStatus(status: ExecutionStatus): Promise<Execution[]>;
  create(execution: Execution): Promise<Execution>;
  update(execution: Execution): Promise<Execution>;
  delete(id: string): Promise<void>;
  countByFlow(flowId: string): Promise<number>;
  countByStatus(orgId: string, status: ExecutionStatus): Promise<number>;
}
