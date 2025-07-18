import Currencies from "@/schemas/public/Currencies";

export type CurrencyPreferenceResponse = {
  currency: Omit<Currencies, "created_at" | "updated_at" | "id"> & {
    id: string;
  };
  is_authenticated: boolean;
};
