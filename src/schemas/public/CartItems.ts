// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { ShoppingCartsId } from './ShoppingCarts';
import type { ProductVariantsId } from './ProductVariants';

/** Identifier type for public.cart_items */
export type CartItemsId = string & { __brand: 'public.cart_items' };

/** Represents the table public.cart_items */
export default interface CartItems {
  id: CartItemsId;

  cart_id: ShoppingCartsId;

  product_variant_id: ProductVariantsId;

  quantity: number;

  unit_price: string;

  added_at: Date;
}

/** Represents the initializer for the table public.cart_items */
export interface CartItemsInitializer {
  id: CartItemsId;

  cart_id: ShoppingCartsId;

  product_variant_id: ProductVariantsId;

  quantity: number;

  unit_price: string;

  /** Default value: CURRENT_TIMESTAMP */
  added_at?: Date;
}

/** Represents the mutator for the table public.cart_items */
export interface CartItemsMutator {
  id?: CartItemsId;

  cart_id?: ShoppingCartsId;

  product_variant_id?: ProductVariantsId;

  quantity?: number;

  unit_price?: string;

  added_at?: Date;
}
