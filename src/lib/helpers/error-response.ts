import { NextResponse } from "next/server";
import { z } from "zod";

import { NextResponseInit } from "@/lib/types/response-init-types";

type ErrorMessage =
  | z.SafeParseSuccess<unknown>
  | {
      [k: string]: string;
    }
  | string;

export function throwError(error: ErrorMessage, opts: NextResponseInit) {
  return NextResponse.json({ error, status: opts.status }, { ...opts });
}

export function handleApiError(error: unknown, opts?: NextResponseInit) {
  if (error instanceof Error) {
    return throwError(error.message, { ...opts });
  }
  return error;
}
