"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { CurrencyPreferenceResponse } from "../types/currency-preference";
import Currencies, { CurrenciesId } from "@/schemas/public/Currencies";
import { useRouter } from "next/navigation";

export type SelectedCurrency = CurrencyPreferenceResponse["currency"];

interface CurrencyState {
  selectedCurrency: SelectedCurrency;
  availableCurrencies: Currencies[];
  isLoading: boolean;
  error: string | null;
}

type CurrencyAction =
  | { type: "SET_SELECTED_CURRENCY"; payload: SelectedCurrency }
  | { type: "SET_AVAILABLE_CURRENCIES"; payload: Currencies[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: CurrencyState = {
  selectedCurrency: {
    id: "1" as CurrenciesId,
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    decimal_places: 2,
    is_active: true,
    locales: "en-US",
  },
  availableCurrencies: [],
  isLoading: false,
  error: null,
};

function currencyReducer(
  state: CurrencyState,
  action: CurrencyAction,
): CurrencyState {
  switch (action.type) {
    case "SET_SELECTED_CURRENCY":
      return {
        ...state,
        selectedCurrency: action.payload,
      };
    case "SET_AVAILABLE_CURRENCIES":
      return {
        ...state,
        availableCurrencies: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

interface CurrencyContextType extends CurrencyState {
  changeCurrency: (currency: SelectedCurrency) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

interface CurrencyProviderProps {
  children: ReactNode;
  initialCurrencies?: Currencies[];
  initialSelectedCurrency?: SelectedCurrency;
}

export function CurrencyProvider({ 
  children, 
  initialCurrencies = [], 
  initialSelectedCurrency 
}: CurrencyProviderProps) {
  const [state, dispatch] = useReducer(currencyReducer, {
    ...initialState,
    availableCurrencies: initialCurrencies,
    selectedCurrency: initialSelectedCurrency || initialState.selectedCurrency,
  });
  const router = useRouter();

  // Load user preference on mount (currencies are now server-side)
  useEffect(() => {
    loadUserPreference();
  }, []);

  const loadUserPreference = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Load user's preferred currency (if authenticated)
      const userCurrencyResponse = await fetch("/api/user/currency-preference");
      if (userCurrencyResponse.ok) {
        const { currency } =
          (await userCurrencyResponse.json()) as CurrencyPreferenceResponse;
        dispatch({
          type: "SET_SELECTED_CURRENCY",
          payload: currency,
        });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load currency preference" });
      console.error("Error loading currency preference:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const refreshCurrencies = async () => {
    await loadUserPreference();
  };

  const changeCurrency = async (currency: SelectedCurrency) => {
    try {
      dispatch({ type: "SET_SELECTED_CURRENCY", payload: currency });

      // Update user preference if authenticated
      const response = await fetch("/api/user/currency-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currencyCode: currency.code,
          currencySymbol: currency.symbol,
        }),
      });

      if (!response.ok) {
        console.warn("Failed to save currency preference to server");
      }
      await refreshCurrencies();
      router.refresh();
    } catch (error) {
      console.error("Error changing currency:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to change currency" });
    }
  };

  const contextValue: CurrencyContextType = {
    ...state,
    changeCurrency,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
