import { NextResponse } from "next/server";
import { getCurrencies } from "@/app/utils/currency-utils";

export async function GET() {
  try {
    const currencies = await getCurrencies();
    return NextResponse.json(currencies);
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 },
    );
  }
}
