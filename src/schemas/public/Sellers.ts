import type { UsersId } from './Users';

export type SellersId = string & { __brand: 'public.sellers' };

export default interface Sellers {
  id: SellersId;

  user_id: UsersId;

  business_name: string;

  business_type: string;

  tax_id: string;

  description: string | null;

  logo_url: string | null;

  rating: string;

  total_reviews: number;

  is_verified: boolean;

  created_at: Date;
}

export interface SellersInitializer {
  id: SellersId;

  user_id: UsersId;

  business_name: string;

  business_type: string;

  tax_id: string;

  description?: string | null;

  logo_url?: string | null;

  rating?: string;

  total_reviews?: number;

  is_verified?: boolean;

  created_at?: Date;
}

export interface SellersMutator {
  id?: SellersId;

  user_id?: UsersId;

  business_name?: string;

  business_type?: string;

  tax_id?: string;

  description?: string | null;

  logo_url?: string | null;

  rating?: string;

  total_reviews?: number;

  is_verified?: boolean;

  created_at?: Date;
}
