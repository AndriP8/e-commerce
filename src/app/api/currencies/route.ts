import { NextResponse } from "next/server";
import { getCurrencies } from "@/app/utils/currency-utils";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const currencies = await getCurrencies();
    return NextResponse.json(currencies);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 },
    );
  }
}
