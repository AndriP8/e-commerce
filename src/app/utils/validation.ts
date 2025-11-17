import { z, ZodError } from "zod";
import { BadRequestError } from "./api-error-handler";

/**
 * Validation utility for API routes
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Validates data against a Zod schema and throws BadRequestError on failure
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = formatZodErrors(error);
      throw new BadRequestError(
        `Validation failed: ${Object.entries(formattedErrors)
          .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
          .join("; ")}`
      );
    }
    throw new BadRequestError("Invalid input data");
  }
}

/**
 * Safely validates data without throwing errors
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: "Validation failed",
        errors: formatZodErrors(result.error),
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Validation error occurred",
    };
  }
}

/**
 * Formats Zod errors into a more readable structure
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  error.issues.forEach((err) => {
    const path = err.path.join(".") || "root";
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });

  return formatted;
}

/**
 * Validates request body
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return validate(schema, body);
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError("Invalid JSON in request body");
  }
}

/**
 * Validates query parameters from URL searchParams
 */
export function validateQuery<T>(
  searchParams: URLSearchParams | Record<string, string | string[]>,
  schema: z.ZodSchema<T>
): T {
  // Convert URLSearchParams to plain object
  const params: Record<string, string> = {};

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } else {
    // Handle Record type
    Object.entries(searchParams).forEach(([key, value]) => {
      params[key] = Array.isArray(value) ? value[0] : value;
    });
  }

  return validate(schema, params);
}

/**
 * Validates path parameters
 */
export function validateParams<T>(
  params: Record<string, string | string[]>,
  schema: z.ZodSchema<T>
): T {
  return validate(schema, params);
}
