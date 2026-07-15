import { z } from "zod";

export interface WorkspaceProps {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Workspace {
  private constructor(private readonly props: WorkspaceProps) {}

  static create(props: Omit<WorkspaceProps, "createdAt" | "updatedAt">): Workspace {
    return new Workspace({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static from(props: WorkspaceProps): Workspace {
    return new Workspace(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get organizationId(): string { return this.props.organizationId; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  rename(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  toJSON(): WorkspaceProps {
    return { ...this.props };
  }
}

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  organizationId: z.string(),
});
