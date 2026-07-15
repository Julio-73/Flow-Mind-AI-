import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { CopilotParser } from "./parser.js";
import { CopilotContextBuilder } from "./context-builder.js";
import { getPrimaryConfig, getFallbackConfig, type UsageResult } from "./models.js";
import { FLOW_GENERATION_TOOLS } from "./tool-calling.js";
import { createLogger } from "@flowmind/shared";
import type { JsonValue } from "@flowmind/shared";

const logger = createLogger("ai:copilot");

export type CopilotAction = "generate_flow" | "optimize_flow" | "explain_flow" | "debug_flow";

export interface CopilotRequest {
  action: CopilotAction;
  systemPrompt: string;
  userPrompt: string;
  context?: string;
}

export interface CopilotResponse {
  result: Record<string, JsonValue>;
  usage: UsageResult;
  model: string;
}

export class Copilot {
  private parser = new CopilotParser();
  private contextBuilder = new CopilotContextBuilder();
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    const openaiKey = process.env["OPENAI_API_KEY"];
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }
    const anthropicKey = process.env["ANTHROPIC_API_KEY"];
    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }
  }

  async generate(request: CopilotRequest): Promise<CopilotResponse> {
    const config = getPrimaryConfig();
    const fullPrompt = request.context
      ? `${request.context}\n\n${request.userPrompt}`
      : request.userPrompt;

    try {
      return await this.callOpenAI(request.systemPrompt, fullPrompt, config);
    } catch (primaryError) {
      logger.warn({ error: primaryError }, "Primary AI model failed, trying fallback");
      try {
        const fallbackConfig = getFallbackConfig();
        return await this.callAnthropic(request.systemPrompt, fullPrompt, fallbackConfig);
      } catch (fallbackError) {
        logger.error({ error: fallbackError }, "Both AI models failed");
        throw primaryError;
      }
    }
  }

  private async callOpenAI(
    systemPrompt: string,
    userPrompt: string,
    config: ReturnType<typeof getPrimaryConfig>,
  ): Promise<CopilotResponse> {
    if (!this.openai) throw new Error("OpenAI API key not configured");

    const response = await this.openai.chat.completions.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: FLOW_GENERATION_TOOLS,
      tool_choice: "auto",
    });

    const message = response.choices[0]?.message;
    const toolCall = message?.tool_calls?.[0];
    const usage: UsageResult = {
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
      model: config.model,
      provider: "openai",
    };

    if (toolCall?.function) {
      const result = this.parser.parseToolCall({
        name: toolCall.function.name ?? "",
        arguments: toolCall.function.arguments ?? "{}",
      });
      return { result, usage, model: config.model };
    }

    const content = message?.content ?? "";
    try {
      const result = this.parser.parseFlowGeneration(content);
      return { result: result as unknown as Record<string, JsonValue>, usage, model: config.model };
    } catch {
      return { result: { content, raw: true }, usage, model: config.model };
    }
  }

  private async callAnthropic(
    systemPrompt: string,
    userPrompt: string,
    config: ReturnType<typeof getFallbackConfig>,
  ): Promise<CopilotResponse> {
    if (!this.anthropic) throw new Error("Anthropic API key not configured");

    const response = await this.anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const usage: UsageResult = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      model: config.model,
      provider: "anthropic",
    };

    const content = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("\n");

    try {
      const result = this.parser.parseFlowGeneration(content);
      return { result: result as unknown as Record<string, JsonValue>, usage, model: config.model };
    } catch {
      return { result: { content, raw: true }, usage, model: config.model };
    }
  }

  isAvailable(): boolean {
    return !!(this.openai || this.anthropic);
  }
}
