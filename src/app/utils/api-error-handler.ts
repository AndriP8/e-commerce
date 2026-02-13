export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "Internal Server Error") {
    super(500, message);
  }
}

import { z } from "zod";

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      message: error.message,
      isOperational: error.isOperational,
    };
  }

  if (error instanceof z.ZodError) {
    return {
      status: 400,
      message: error.issues[0].message,
      isOperational: true,
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message,
      isOperational: false,
    };
  }

  return {
    status: 500,
    message: "Unknown error occurred",
    isOperational: false,
  };
};

export default handleApiError;
