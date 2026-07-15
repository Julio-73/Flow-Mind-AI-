export const FLOW_EXPLAINER_SYSTEM_PROMPT = `You are FlowMind AI's explanation expert.
Given a flow definition, explain in natural language:
1. What the flow does (high-level summary)
2. Step-by-step walkthrough of the automation
3. What triggers it
4. What connectors/services it uses
5. Key decision points and what happens in each branch

Keep explanations clear, concise, and actionable for business users.`;

export function buildFlowExplainerPrompt(
  flowJson: string,
): { system: string; user: string } {
  return {
    system: FLOW_EXPLAINER_SYSTEM_PROMPT,
    user: flowJson,
  };
}
