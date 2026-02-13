"use client";

import { AuthProvider } from "@/app/contexts/AuthContext";
import { CsrfProvider } from "@/app/contexts/CsrfContext";
import { CurrencyProvider, SelectedCurrency } from "@/app/contexts/CurrencyContext";
import { NuqsAdapter } from "nuqs/adapters/next";
import { User } from "../layout";
import { Currencies } from "@/schemas/db-schemas";

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
          <NuqsAdapter>{children}</NuqsAdapter>
        </CurrencyProvider>
      </AuthProvider>
    </CsrfProvider>
  );
}
