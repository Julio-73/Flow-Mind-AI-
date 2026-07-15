import { createLogger } from "@flowmind/shared";

const logger = createLogger("ai:models");

export interface AIModelConfig {
  provider: "openai" | "anthropic";
  model: string;
  maxTokens: number;
  temperature: number;
}

export function getPrimaryConfig(): AIModelConfig {
  return {
    provider: "openai",
    model: process.env["OPENAI_MODEL"] ?? "gpt-4o",
    maxTokens: parseInt(process.env["OPENAI_MAX_TOKENS"] ?? "4096", 10),
    temperature: parseFloat(process.env["OPENAI_TEMPERATURE"] ?? "0.2"),
  };
}

export function getFallbackConfig(): AIModelConfig {
  return {
    provider: "anthropic",
    model: process.env["ANTHROPIC_MODEL"] ?? "claude-3-opus-20240229",
    maxTokens: parseInt(process.env["ANTHROPIC_MAX_TOKENS"] ?? "4096", 10),
    temperature: parseFloat(process.env["ANTHROPIC_TEMPERATURE"] ?? "0.2"),
  };
}

export interface UsageResult {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  provider: string;
}
