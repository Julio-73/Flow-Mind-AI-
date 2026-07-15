import { createLogger } from "@flowmind/shared";

type EventHandler = (data: Record<string, unknown>) => void | Promise<void>;

const logger = createLogger("engine:events");

export class EventEmitter {
  private listeners = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, data: Record<string, unknown>): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    logger.debug({ event, data }, "Emitting event");

    for (const handler of handlers) {
      try {
        const result = handler(data);
        if (result instanceof Promise) {
          result.catch((err) => {
            logger.error({ event, err }, "Event handler error");
          });
        }
      } catch (err) {
        logger.error({ event, err }, "Event handler error");
      }
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}
