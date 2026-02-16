"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { calculateTax } from "@/app/utils/tax-utils";

type CheckoutCostContextType = {
  shippingCost: number;
  updateShippingCost: (cost: number) => void;
  subtotal: number;
  updateSubtotal: (subtotal: number) => void;
  tax: number;
};

const CheckoutCostContext = createContext<CheckoutCostContextType | undefined>(
  undefined,
);

export function CheckoutCostProvider({ children }: { children: ReactNode }) {
  const [shippingCost, setShippingCost] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  const updateShippingCost = (cost: number) => {
    setShippingCost(cost);
  };

  const updateSubtotal = (newSubtotal: number) => {
    setSubtotal(newSubtotal);
  };

  // Calculate tax based on subtotal
  const tax = useMemo(() => calculateTax(subtotal), [subtotal]);

  return (
    <CheckoutCostContext.Provider
      value={{
        shippingCost,
        updateShippingCost,
        subtotal,
        updateSubtotal,
        tax,
      }}
    >
      {children}
    </CheckoutCostContext.Provider>
  );
}

export function useCheckoutCost() {
  const context = useContext(CheckoutCostContext);
  if (context === undefined) {
    throw new Error(
      "useCheckoutCost must be used within a CheckoutCostProvider",
    );
  }
  return context;
}
