import type { BaseConnector } from "./base-connector.js";
import { SlackConnector } from "./slack/index.js";
import { GmailConnector } from "./gmail/index.js";
import { HttpConnector } from "./http/index.js";
import { WebhookConnector } from "./webhook/index.js";
import { DelayConnector } from "./delay/index.js";
import { AIConnector } from "./ai/index.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("connectors:registry");

export class ConnectorRegistry {
  private connectors = new Map<string, BaseConnector>();

  constructor() {
    this.register(new SlackConnector());
    this.register(new GmailConnector());
    this.register(new HttpConnector());
    this.register(new WebhookConnector());
    this.register(new DelayConnector());
    this.register(new AIConnector());
    logger.info(`Registered ${this.connectors.size} connectors`);
  }

  register(connector: BaseConnector): void {
    this.connectors.set(connector.type, connector);
    logger.debug({ type: connector.type, name: connector.name }, "Connector registered");
  }

  get(type: string): BaseConnector | undefined {
    return this.connectors.get(type);
  }

  getAll(): BaseConnector[] {
    return Array.from(this.connectors.values());
  }

  getTypes(): string[] {
    return Array.from(this.connectors.keys());
  }

  async executeAction(
    connectorType: string,
    actionId: string,
    config: Record<string, unknown>,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const connector = this.get(connectorType);
    if (!connector) {
      throw new Error(`Connector '${connectorType}' not found`);
    }
    return connector.executeAction(actionId, config as any, input as any);
  }
}

export const connectorRegistry = new ConnectorRegistry();
