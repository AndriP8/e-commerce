import type { UsersId } from './Users';
import type { CurrenciesId } from './Currencies';

export type UserPreferencesId = string & { __brand: 'public.user_preferences' };

export default interface UserPreferences {
  id: UserPreferencesId;

  user_id: UsersId;

  preferred_currency_id: CurrenciesId;

  language: string | null;

  timezone: string | null;

  created_at: Date;

  updated_at: Date | null;
}

export interface UserPreferencesInitializer {
  
  id?: UserPreferencesId;

  user_id: UsersId;

  preferred_currency_id?: CurrenciesId;

  language?: string | null;

  timezone?: string | null;

  created_at?: Date;

  updated_at?: Date | null;
}

export interface UserPreferencesMutator {
  id?: UserPreferencesId;

  user_id?: UsersId;

  preferred_currency_id?: CurrenciesId;

  language?: string | null;

  timezone?: string | null;

  created_at?: Date;

  updated_at?: Date | null;
}
