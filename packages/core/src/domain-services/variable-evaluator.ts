import type { JsonValue } from "@flowmind/shared";

const VARIABLE_PATTERN = /\{\{\s*(\$?\w+(?:\.\w+)*)\s*\}\}/g;
const CONDITION_PATTERN = /\{\%\s*(if|else|endif|for|endfor)\s*(.*?)\s*\%\}/g;

export interface VariableProvider {
  getValue(path: string): JsonValue | undefined;
}

export class VariableEvaluator {
  constructor(private readonly providers: VariableProvider[]) {}

  evaluate(template: string, context: Record<string, JsonValue>): string {
    return template.replace(VARIABLE_PATTERN, (match, path: string) => {
      const value = this.resolvePath(path.trim(), context);
      if (value === undefined || value === null) return match;
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    });
  }

  evaluateJson(
    template: string,
    context: Record<string, JsonValue>,
  ): JsonValue {
    const result = this.evaluate(template, context);
    try {
      return JSON.parse(result) as JsonValue;
    } catch {
      return result;
    }
  }

  evaluateCondition(
    condition: string,
    context: Record<string, JsonValue>,
  ): boolean {
    const resolved = this.evaluate(condition, context);

    if (resolved === "true") return true;
    if (resolved === "false") return false;
    if (resolved === "1" || resolved === "yes") return true;
    if (resolved === "0" || resolved === "no") return false;

    const num = Number(resolved);
    if (!Number.isNaN(num)) return num !== 0;

    return resolved.length > 0;
  }

  extractVariableReferences(template: string): string[] {
    const refs: string[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(VARIABLE_PATTERN.source, "g");
    while ((match = regex.exec(template)) !== null) {
      const path = match[1]!;
      if (!refs.includes(path)) refs.push(path);
    }
    return refs;
  }

  private resolvePath(
    path: string,
    context: Record<string, JsonValue>,
  ): JsonValue | undefined {
    if (path.startsWith("$")) {
      for (const provider of this.providers) {
        const val = provider.getValue(path);
        if (val !== undefined) return val;
      }
    }
    const parts = path.split(".");
    let current: JsonValue | undefined = context;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== "object" || Array.isArray(current)) return undefined;
      current = (current as Record<string, JsonValue>)[part];
    }

    return current;
  }
}
