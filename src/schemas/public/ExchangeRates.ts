import type { CurrenciesId } from './Currencies';

export type ExchangeRatesId = string & { __brand: 'public.exchange_rates' };

export default interface ExchangeRates {
  id: ExchangeRatesId;

  from_currency_id: CurrenciesId;

  to_currency_id: CurrenciesId;

  rate: string;

  effective_date: Date;

  created_at: Date;

  updated_at: Date | null;
}

export interface ExchangeRatesInitializer {
  
  id?: ExchangeRatesId;

  from_currency_id: CurrenciesId;

  to_currency_id: CurrenciesId;

  rate: string;

  effective_date?: Date;

  created_at?: Date;

  updated_at?: Date | null;
}

export interface ExchangeRatesMutator {
  id?: ExchangeRatesId;

  from_currency_id?: CurrenciesId;

  to_currency_id?: CurrenciesId;

  rate?: string;

  effective_date?: Date;

  created_at?: Date;

  updated_at?: Date | null;
}
