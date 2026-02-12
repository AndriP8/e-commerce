import type { SellersId } from "./Sellers";
import type { CategoriesId } from "./Categories";

export type ProductsId = string & { __brand: "public.products" };

export default interface Products {
  id: ProductsId;

  seller_id: SellersId;

  category_id: CategoriesId;

  name: string;

  description: string;

  base_price: string;

  sku: string;

  brand: string | null;

  weight: string | null;

  dimensions: string | null;

  is_active: boolean | null;
  slug: string;

  created_at: Date;

  updated_at: Date | null;
}

export interface ProductsInitializer {
  id: ProductsId;

  seller_id: SellersId;

  category_id: CategoriesId;

  name: string;

  description: string;

  base_price: string;

  sku: string;

  brand?: string | null;

  weight?: string | null;

  dimensions?: string | null;

  is_active?: boolean | null;

  created_at?: Date;

  updated_at?: Date | null;
}

export interface ProductsMutator {
  id?: ProductsId;

  seller_id?: SellersId;

  category_id?: CategoriesId;

  name?: string;

  description?: string;

  base_price?: string;

  sku?: string;

  brand?: string | null;

  weight?: string | null;

  dimensions?: string | null;

  is_active?: boolean | null;

  created_at?: Date;

  updated_at?: Date | null;
}
