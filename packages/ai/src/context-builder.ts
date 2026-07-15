import type { JsonValue } from "@flowmind/shared";

export interface CopilotContext {
  installedConnectors: Array<{ type: string; name: string; actions: string[]; triggers: string[] }>;
  recentFlows: Array<{ name: string; triggerType: string; nodeCount: number }>;
  templates: Array<{ name: string; category: string; description: string }>;
  workspaceName: string;
  organizationName: string;
}

export class CopilotContextBuilder {
  buildContext(params: Partial<CopilotContext>): string {
    const parts: string[] = [];

    if (params.workspaceName) {
      parts.push(`Current workspace: ${params.workspaceName}`);
    }

    if (params.organizationName) {
      parts.push(`Organization: ${params.organizationName}`);
    }

    if (params.installedConnectors && params.installedConnectors.length > 0) {
      const connectorList = params.installedConnectors
        .map((c) => `- ${c.name} (${c.type}): actions=[${c.actions.join(", ")}], triggers=[${c.triggers.join(", ")}]`)
        .join("\n");
      parts.push(`Installed connectors:\n${connectorList}`);
    }

    if (params.recentFlows && params.recentFlows.length > 0) {
      parts.push("Recent flows:");
      for (const f of params.recentFlows) {
        parts.push(`- "${f.name}" (${f.triggerType}, ${f.nodeCount} nodes)`);
      }
    }

    if (params.templates && params.templates.length > 0) {
      const templateList = params.templates
        .map((t) => `- "${t.name}" (${t.category}): ${t.description}`)
        .join("\n");
      parts.push(`Available templates:\n${templateList}`);
    }

    return parts.join("\n\n");
  }
}
