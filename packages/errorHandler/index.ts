export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

// Not Found error
export class NotFoundError extends AppError {
  constructor(message = "Request not found", details?: any) {
    super(message, 404, false, details);
  }
}

// Server error
export class ServerError extends AppError {
  constructor(message = "Server error", details?: any) {
    super(message, 500, false, details);
  }
}

// Bad request error
export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: any) {
    super(message, 400, false, details);
  }
}
// validation error
export class ValidationError extends AppError {
  constructor(message = "Bad request", details?: any) {
    super(message, 400, false, details);
  }
}
// Unauthorized error
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: any) {
    super(message, 401, false, details);
  }
}

// Forbidden error
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: any) {
    super(message, 403, false, details);
  }
}

// Conflict error
export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: any) {
    super(message, 409, false, details);
  }
}

// Too many requests error
export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests", details?: any) {
    super(message, 429, false, details);
  }
}

// Internal server error
export class InternalServerError extends AppError {
  constructor(message = "Internal server error", details?: any) {
    super(message, 500, false, details);
  }
}

// Service unavailable error
export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", details?: any) {
    super(message, 503, false, details);
  }
}

// Gateway timeout error
export class GatewayTimeoutError extends AppError {
  constructor(message = "Gateway timeout", details?: any) {
    super(message, 504, false, details);
  }
}

//Database error
export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, false, details);
  }
}
