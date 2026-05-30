"use client";
import dynamic from "next/dynamic";

// Import the client component with dynamic to avoid SSR issues
const DynamicOrderSummary = dynamic(() => import("./OrderSummary"), {
  ssr: false,
});
export default DynamicOrderSummary;
