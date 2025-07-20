import Currencies from "@/schemas/public/Currencies";

export const formatPrice = (amount: number, currency: Currencies): string => {
  return new Intl.NumberFormat(currency.locales, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.decimal_places,
    maximumFractionDigits: currency.decimal_places,
  }).format(amount);
};
