export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      "NOT_FOUND",
      404,
      { resource, id },
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "AUTH_ERROR", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterMs: number) {
    super("Too many requests", "RATE_LIMIT", 429, { retryAfterMs });
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}

export class ConnectorError extends AppError {
  constructor(message: string, public readonly connectorType: string) {
    super(message, "CONNECTOR_ERROR", 502, { connectorType });
  }
}

export class FlowExecutionError extends AppError {
  constructor(
    message: string,
    public readonly flowId: string,
    public readonly nodeId?: string,
  ) {
    super(message, "FLOW_EXECUTION_ERROR", 500, { flowId, nodeId });
  }
}
