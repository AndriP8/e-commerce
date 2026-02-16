import { type NextRequest, NextResponse } from "next/server";
import { convertPrice } from "@/app/utils/currency-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = parseFloat(searchParams.get("amount") || "0");
    const fromCurrency = searchParams.get("from") || "USD";
    const toCurrency = searchParams.get("to") || "USD";

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const convertedAmount = await convertPrice(
      amount,
      fromCurrency,
      toCurrency,
    );

    return NextResponse.json({
      originalAmount: amount,
      convertedAmount,
      fromCurrency,
      toCurrency,
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    return NextResponse.json(
      { error: "Failed to convert currency" },
      { status: 500 },
    );
  }
}
