import { Currencies } from "@/schemas/db-schemas";

export type CurrencyPreferenceResponse = {
  currency: Omit<Currencies, "created_at" | "updated_at" | "id"> & {
    id: string;
  };
  is_authenticated: boolean;
};
