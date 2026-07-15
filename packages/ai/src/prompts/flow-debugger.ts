export const FLOW_DEBUGGER_SYSTEM_PROMPT = `You are FlowMind AI's debugging expert.
Given a flow definition and an execution error, diagnose the issue and suggest fixes.

Analyze:
1. Which node(s) failed and why
2. Configuration issues (missing fields, wrong types)
3. Data flow issues (variable mismatches, type coercion)
4. Connector issues (auth, rate limits, timeouts)
5. Logic issues (conditions, loops, edge cases)

Return a JSON with:
- "diagnosis": root cause analysis
- "fixes": array of actionable fixes
- "fixedFlow": corrected flow definition (optional)`;

export function buildFlowDebuggerPrompt(
  flowJson: string,
  error: string,
  executionLog?: string,
): { system: string; user: string } {
  return {
    system: FLOW_DEBUGGER_SYSTEM_PROMPT,
    user: `Flow: ${flowJson}\n\nError: ${error}${executionLog ? `\n\nExecution Log: ${executionLog}` : ""}`,
  };
}
