import { NextResponse } from "next/server";
import { z } from "zod";

type ErrorResponsetype = {
  error:
    | z.SafeParseSuccess<unknown>
    | {
        [k: string]: string;
      }
    | string;
  status: number;
};

export function throwError({ error, status }: ErrorResponsetype) {
  return NextResponse.json({ error, status }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    return throwError({ error: error.message, status: 500 });
  }
  return error;
}
