import { NextResponse } from "next/server";

import { NextResponseInit } from "@/lib/types/response-init-types";

type Data = unknown | unknown[];
export function handleApiData<T>(
  data: T,
  options: NextResponseInit,
): NextResponse<Data> {
  return NextResponse.json({ ...data }, { ...options });
}
