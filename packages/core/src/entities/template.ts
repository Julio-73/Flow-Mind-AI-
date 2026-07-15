import { z } from "zod";
import type { JsonValue } from "@flowmind/shared";

export interface TemplateProps {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  flowData: {
    nodes: Array<{
      id: string;
      type: string;
      label: string;
      position: { x: number; y: number };
      config: Record<string, JsonValue>;
    }>;
    edges: Array<{
      id: string;
      sourceNodeId: string;
      targetNodeId: string;
      label?: string;
      condition?: string;
    }>;
  };
  requiredConnectors: string[];
  popularity: number;
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Template {
  private constructor(private readonly props: TemplateProps) {}

  static create(props: Omit<TemplateProps, "createdAt" | "updatedAt" | "popularity" | "isOfficial">): Template {
    return new Template({
      ...props,
      popularity: 0,
      isOfficial: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static from(props: TemplateProps): Template {
    return new Template(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string { return this.props.description; }
  get category(): string { return this.props.category; }
  get icon(): string { return this.props.icon; }
  get flowData(): TemplateProps["flowData"] { return this.props.flowData; }
  get requiredConnectors(): string[] { return [...this.props.requiredConnectors]; }
  get popularity(): number { return this.props.popularity; }
  get isOfficial(): boolean { return this.props.isOfficial; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  incrementPopularity(): void {
    this.props.popularity += 1;
    this.props.updatedAt = new Date();
  }

  toJSON(): TemplateProps {
    return { ...this.props };
  }
}
