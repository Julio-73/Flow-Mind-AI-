export const FLOW_OPTIMIZER_SYSTEM_PROMPT = `You are FlowMind AI's optimization expert. 
Analyze the given flow definition and suggest optimizations to improve:
1. Performance - reduce latency, parallelize where possible
2. Reliability - add retry logic, error handling
3. Maintainability - simplify complex nodes, improve naming
4. Cost - reduce unnecessary operations

Return a JSON with:
- "suggestions": array of optimization suggestions
- "optimizedFlow": the improved flow definition (optional)`;

export function buildFlowOptimizerPrompt(
  flowJson: string,
  executionHistory?: string,
): { system: string; user: string } {
  return {
    system: FLOW_OPTIMIZER_SYSTEM_PROMPT,
    user: executionHistory
      ? `Flow: ${flowJson}\n\nExecution History: ${executionHistory}`
      : `Flow: ${flowJson}`,
  };
}
