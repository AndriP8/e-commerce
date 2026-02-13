import { z } from "zod";

/**
 * Checks if a field at a given path is required in a Zod schema.
 * Handles nested objects.
 *
 * @param schema The Zod schema to introspect
 * @param path The path to the field (e.g., "addressDetail.receiver_name")
 * @returns boolean True if the field is required
 */
export function isFieldRequired(schema: z.ZodTypeAny | undefined, path: string): boolean {
  if (!schema) return false;

  const parts = path.split(".");
  let currentSchema: z.ZodTypeAny = schema;

  for (const part of parts) {
    // Unwrap ZodEffects (common when using refine)
    const def = currentSchema._def as any;
    if ("schema" in def) {
      currentSchema = def.schema;
    }

    // If it's an object, look for the property
    if (currentSchema instanceof z.ZodObject) {
      const shape = currentSchema.shape;
      if (part in shape) {
        currentSchema = shape[part];
      } else {
        return false;
      }
    } else {
      // If we're at a path part but the schema isn't an object, we can't go deeper
      break;
    }
  }

  // Check if the final schema is optional or nullable
  // We consider it "required" if it's NOT an instance of ZodOptional or ZodNullable
  // and it's not a ZodDefault

  let isOptional = false;
  let isNullable = false;

  let checkSchema = currentSchema;
  while ("_def" in checkSchema) {
    if (checkSchema instanceof z.ZodOptional) {
      isOptional = true;
      break;
    }
    if (checkSchema instanceof z.ZodNullable) {
      isNullable = true;
      break;
    }
    if (checkSchema instanceof z.ZodDefault) {
      // Default values make the field optional in the input but required in the output
      // For form validation purposes, we usually consider them optional to fill
      isOptional = true;
      break;
    }

    // Unwrap ZodEffects, etc.
    const def = checkSchema._def as any;
    if ("schema" in def) {
      checkSchema = def.schema;
    } else {
      break;
    }
  }

  return !isOptional && !isNullable;
}
