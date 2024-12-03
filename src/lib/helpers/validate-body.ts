import { z } from "zod";

type validateBodytype = {
  body:
    | z.SafeParseSuccess<unknown>
    | {
        [k: string]: string;
      };
  schema: z.ZodSchema;
};

export function validateBody({ body, schema }: validateBodytype) {
  const parsedBody = schema.safeParse(body);
  if (!parsedBody.success) {
    const error = Object.fromEntries(
      Object.entries(parsedBody.error.flatten().fieldErrors).map(
        ([field, messages]) => [field, messages ? messages[0] : ""],
      ),
    );
    return {
      error,
      data: null,
      success: false,
    };
  }
  return parsedBody;
}
