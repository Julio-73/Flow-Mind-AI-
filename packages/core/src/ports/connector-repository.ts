import type { Connector } from "../entities/connector.js";

export interface ConnectorRepository {
  findById(id: string): Promise<Connector | null>;
  findByOrganization(orgId: string): Promise<Connector[]>;
  findByType(orgId: string, type: string): Promise<Connector[]>;
  create(connector: Connector): Promise<Connector>;
  update(connector: Connector): Promise<Connector>;
  delete(id: string): Promise<void>;
}
