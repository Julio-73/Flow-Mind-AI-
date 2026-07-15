import { NodeType } from "@flowmind/core";
import { NodeResolver } from "@flowmind/core";
import { ExecutionEngine, type ExecutionState, type NodeResult } from "@flowmind/core";
import { VariableResolver } from "./variable-resolver.js";
import { ContextBuilder } from "./context-builder.js";
import { RetryManager } from "./retry-manager.js";
import { EventEmitter } from "./event-emitter.js";
import { TriggerHandler } from "./node-handlers/trigger-handler.js";
import { ActionHandler } from "./node-handlers/action-handler.js";
import { ConditionHandler } from "./node-handlers/condition-handler.js";
import { DelayHandler } from "./node-handlers/delay-handler.js";
import { AIHandler } from "./node-handlers/ai-handler.js";
import { LoopHandler } from "./node-handlers/loop-handler.js";
import { TransformHandler } from "./node-handlers/transform-handler.js";
import { FlowExecutionError, createLogger, type JsonValue } from "@flowmind/shared";
import type { Flow, Edge, FlowNodeData } from "@flowmind/core";
import type { ExecutionStatus } from "@flowmind/core";

const logger = createLogger("engine:executor");

export interface ExecutorConfig {
  maxRetries: number;
  defaultTimeoutMs: number;
}

export class Executor {
  private nodeResolver = new NodeResolver();
  private executionEngine = new ExecutionEngine();
  private variableResolver = new VariableResolver();
  private contextBuilder = new ContextBuilder();
  private retryManager: RetryManager;
  private eventEmitter: EventEmitter;

  private triggerHandler = new TriggerHandler();
  private actionHandler = new ActionHandler();
  private conditionHandler = new ConditionHandler();
  private delayHandler = new DelayHandler();
  private aiHandler = new AIHandler();
  private loopHandler = new LoopHandler();
  private transformHandler = new TransformHandler();

  constructor(
    private config: ExecutorConfig = { maxRetries: 3, defaultTimeoutMs: 30000 },
  ) {
    this.retryManager = new RetryManager(config.maxRetries);
    this.eventEmitter = new EventEmitter();
  }

  get events(): EventEmitter { return this.eventEmitter; }

  async execute(
    flow: Flow,
    triggerData: Record<string, unknown>,
    executionId: string,
  ): Promise<ExecutionState> {
    const execution = this.executionEngine.createState({
      id: executionId,
      flowId: flow.id,
      workspaceId: flow.workspaceId,
      organizationId: flow.organizationId,
      triggeredBy: null,
      status: "PENDING" as ExecutionStatus,
      triggerData: triggerData as any,
      steps: [],
      error: null,
      durationMs: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    execution.context = { ...triggerData };

    this.executionEngine.startExecution(execution);
    this.eventEmitter.emit("execution:started", {
      executionId: execution.executionId,
      flowId: flow.id,
    });

    const { ordered, hasCycle } = this.nodeResolver.resolveExecutionOrder(
      flow.nodes,
      flow.edges,
    );

    if (hasCycle) {
      const error = "Flow contains a cycle";
      this.executionEngine.recordError(execution, "", error);
      this.executionEngine.completeExecution(execution, false);
      this.eventEmitter.emit("execution:failed", { executionId, error });
      return execution;
    }

    try {
      for (const nodeId of ordered) {
        const node = flow.nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        execution.currentNodeId = nodeId;
        this.eventEmitter.emit("execution:node_started", {
          executionId,
          nodeId,
        });

        const dependencies = this.nodeResolver.getDependencies(nodeId, flow.edges);
        const nodeContext = this.contextBuilder.buildNodeContext(
          execution.context as any,
          dependencies,
          execution.nodeResults,
        );

        const resolvedInput = this.variableResolver.resolveNodeInput(
          node,
          nodeContext,
        );

        const result = await this.executeNodeWithRetry(
          node,
          resolvedInput,
          execution,
        );

        this.executionEngine.completeNode(execution, result);

        this.eventEmitter.emit("execution:node_completed", {
          executionId,
          nodeId,
          status: result.status,
          durationMs: result.durationMs,
        });

        if (result.status === "FAILED" && !this.retryManager.shouldRetry(execution)) {
          throw new FlowExecutionError(
            result.error ?? "Node execution failed",
            flow.id,
            nodeId,
          );
        }
      }

      this.executionEngine.completeExecution(execution, true);
      this.eventEmitter.emit("execution:completed", {
        executionId,
        durationMs: execution.nodeResults.size,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.executionEngine.recordError(execution, execution.currentNodeId ?? "", message);
      this.executionEngine.completeExecution(execution, false);
      this.eventEmitter.emit("execution:failed", { executionId, error: message });
    }

    return execution;
  }

  private async executeNodeWithRetry(
    node: FlowNodeData,
    input: Record<string, unknown>,
    state: ExecutionState,
  ): Promise<NodeResult> {
    const startTime = Date.now();
    const startedAt = new Date();

    const execute = async (attempt: number): Promise<NodeResult> => {
      const timeoutMs = (node as any).timeoutMs ?? this.config.defaultTimeoutMs;
      try {
        let output: Record<string, JsonValue> = {};

        const handlerPromise = (async () => {
          switch (node.type) {
            case NodeType.TRIGGER:
            case NodeType.WEBHOOK:
              return await this.triggerHandler.execute(node, input as any);
            case NodeType.ACTION:
              return await this.actionHandler.execute(node, input as any);
            case NodeType.CONDITION:
              return await this.conditionHandler.execute(node, input as any);
            case NodeType.DELAY:
              return await this.delayHandler.execute(node, input as any);
            case NodeType.AI:
              return await this.aiHandler.execute(node, input as any);
            case NodeType.LOOP:
              return await this.loopHandler.execute(node, input as any, state.context as any);
            case NodeType.TRANSFORM:
              return await this.transformHandler.execute(node, input as any);
            default:
              throw new Error(`Unknown node type: ${node.type}`);
          }
        })();
        output = await Promise.race([
          handlerPromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Node ${node.id} timed out after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);

        return {
          nodeId: node.id,
          status: "SUCCESS",
          output,
          error: null,
          attempt,
          durationMs: Date.now() - startTime,
          startedAt,
          completedAt: new Date(),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";

        if (this.retryManager.shouldRetry(state, attempt)) {
          state.retryCount += 1;
          const backoffMs = this.retryManager.getBackoff(attempt);
          logger.warn({ nodeId: node.id, attempt, backoffMs, error: message }, "Retrying node");
          await this.sleep(backoffMs);
          return execute(attempt + 1);
        }

        return {
          nodeId: node.id,
          status: "FAILED",
          output: null,
          error: message,
          attempt,
          durationMs: Date.now() - startTime,
          startedAt,
          completedAt: new Date(),
        };
      }
    };

    return execute(1);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async shutdown(): Promise<void> {
    logger.info("Executor shutting down");
  }
}
