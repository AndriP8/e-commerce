export type CurrenciesId = string & { __brand: 'public.currencies' };

export default interface Currencies {
  id: CurrenciesId;

  code: string;

  name: string;

  symbol: string;

  decimal_places: number;

  is_active: boolean;

  created_at: Date;

  updated_at: Date | null;

  locales: string;
}

export interface CurrenciesInitializer {
  
  id?: CurrenciesId;

  code: string;

  name: string;

  symbol: string;

  decimal_places?: number;

  is_active?: boolean;

  created_at?: Date;

  updated_at?: Date | null;

  locales: string;
}

export interface CurrenciesMutator {
  id?: CurrenciesId;

  code?: string;

  name?: string;

  symbol?: string;

  decimal_places?: number;

  is_active?: boolean;

  created_at?: Date;

  updated_at?: Date | null;

  locales?: string;
}
