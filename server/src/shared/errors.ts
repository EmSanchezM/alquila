import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Errors whose message is safe to show to API clients.
 * Anything else that reaches the error handler is answered as a generic 500.
 */
export class AppError extends Error {
  constructor(message: string, readonly status: ContentfulStatusCode) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}
