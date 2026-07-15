import type { Organization } from "../entities/organization.js";

export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  create(org: Organization): Promise<Organization>;
  update(org: Organization): Promise<Organization>;
  delete(id: string): Promise<void>;
  findUserOrganizations(userId: string): Promise<Organization[]>;
}
