import { z } from "zod";
import { Slug, SlugSchema } from "../value-objects/slug.js";

export interface OrganizationProps {
  id: string;
  name: string;
  slug: Slug;
  logoUrl?: string | null;
  ownerId: string;
  maxSeats: number;
  features: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export class Organization {
  private constructor(private readonly props: OrganizationProps) {}

  static create(props: Omit<OrganizationProps, "createdAt" | "updatedAt" | "features">): Organization {
    return new Organization({
      ...props,
      features: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static from(props: OrganizationProps): Organization {
    return new Organization(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get slug(): Slug { return this.props.slug; }
  get logoUrl(): string | null | undefined { return this.props.logoUrl; }
  get ownerId(): string { return this.props.ownerId; }
  get maxSeats(): number { return this.props.maxSeats; }
  get features(): Record<string, boolean> { return { ...this.props.features }; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateSettings(data: { name?: string; logoUrl?: string | null }): void {
    if (data.name !== undefined) this.props.name = data.name;
    if (data.logoUrl !== undefined) this.props.logoUrl = data.logoUrl;
    this.props.updatedAt = new Date();
  }

  hasFeature(feature: string): boolean {
    return this.props.features[feature] === true;
  }

  setFeature(feature: string, enabled: boolean): void {
    this.props.features[feature] = enabled;
    this.props.updatedAt = new Date();
  }

  toJSON(): OrganizationProps {
    return { ...this.props };
  }
}

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});
