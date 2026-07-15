export const FLOW_GENERATION_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "generate_flow",
      description: "Generate a complete flow definition with nodes and edges",
      parameters: {
        type: "object",
        properties: {
          nodes: {
            type: "array",
            description: "Array of flow nodes",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "Unique node ID" },
                type: { type: "string", enum: ["TRIGGER", "ACTION", "CONDITION", "DELAY", "AI", "WEBHOOK", "LOOP", "TRANSFORM"] },
                label: { type: "string", description: "Human-readable label" },
                position: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                  },
                  required: ["x", "y"],
                },
                config: {
                  type: "object",
                  description: "Node-specific configuration",
                },
              },
              required: ["id", "type", "label", "position", "config"],
            },
          },
          edges: {
            type: "array",
            description: "Array of connections between nodes",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                sourceNodeId: { type: "string" },
                targetNodeId: { type: "string" },
                label: { type: "string" },
                condition: { type: "string" },
              },
              required: ["id", "sourceNodeId", "targetNodeId"],
            },
          },
          description: { type: "string", description: "Description of what this flow does" },
        },
        required: ["nodes", "edges"],
      },
    },
  },
];

export const FLOW_OPTIMIZE_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "optimize_flow",
      description: "Analyze and suggest optimizations for a flow",
      parameters: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["performance", "reliability", "maintainability", "cost"] },
                description: { type: "string" },
                impact: { type: "string", enum: ["high", "medium", "low"] },
                nodeId: { type: "string" },
              },
              required: ["type", "description", "impact"],
            },
          },
        },
        required: ["suggestions"],
      },
    },
  },
];
