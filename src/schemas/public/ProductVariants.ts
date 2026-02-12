import type { ProductsId } from './Products';

export type ProductVariantsId = string & { __brand: 'public.product_variants' };

export default interface ProductVariants {
  id: ProductVariantsId;

  product_id: ProductsId;

  variant_name: string;

  price: string;

  sku: string;

  stock_quantity: number;

  variant_attributes: unknown;

  is_active: boolean | null;
}

export interface ProductVariantsInitializer {
  id: ProductVariantsId;

  product_id: ProductsId;

  variant_name: string;

  price: string;

  sku: string;

  stock_quantity?: number;

  variant_attributes: unknown;

  is_active?: boolean | null;
}

export interface ProductVariantsMutator {
  id?: ProductVariantsId;

  product_id?: ProductsId;

  variant_name?: string;

  price?: string;

  sku?: string;

  stock_quantity?: number;

  variant_attributes?: unknown;

  is_active?: boolean | null;
}
