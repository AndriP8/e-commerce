import { NextResponse } from "next/server";

import { NextResponseInit } from "@/lib/types/response-init-types";

type Data = unknown | unknown[];
export const handleApiData = (
  data: Data,
  opts: NextResponseInit,
): NextResponse<Data> => {
  return NextResponse.json({ data }, { ...opts });
};
