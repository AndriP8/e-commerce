import Currencies from "@/schemas/public/Currencies";

export type CurrencyPreferenceResponse = {
  currency: Omit<Currencies, "created_at" | "updated_at">;
  is_authenticated: boolean;
};
