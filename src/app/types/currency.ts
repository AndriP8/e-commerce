export type Currency = {
  code: string;
  name: string;
  symbol: string;
  locales?: string;
};

export type CurrencyConversion = {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
};
