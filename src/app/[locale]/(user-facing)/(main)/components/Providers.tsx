"use client";

import { NuqsAdapter } from "nuqs/adapters/next";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { CartProvider } from "@/app/contexts/CartContext";
import { CsrfProvider } from "@/app/contexts/CsrfContext";
import {
  CurrencyProvider,
  type SelectedCurrency,
} from "@/app/contexts/CurrencyContext";
import type { User } from "@/app/types/user";
import type { Currencies } from "@/schemas/db-schemas";

interface ProvidersProps {
  children: React.ReactNode;
  initialUser: User | null;
  initialCurrencies: Currencies[];
  initialSelectedCurrency?: SelectedCurrency;
}

export function Providers({
  children,
  initialUser,
  initialCurrencies,
  initialSelectedCurrency,
}: ProvidersProps) {
  return (
    <CsrfProvider>
      <AuthProvider initialUser={initialUser}>
        <CurrencyProvider
          initialCurrencies={initialCurrencies}
          initialSelectedCurrency={initialSelectedCurrency}
        >
          <CartProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </CsrfProvider>
  );
}
