import type { ShoppingCartsId } from './ShoppingCarts';
import type { ProductVariantsId } from './ProductVariants';

export type CartItemsId = string & { __brand: 'public.cart_items' };

export default interface CartItems {
  id: CartItemsId;

  cart_id: ShoppingCartsId;

  product_variant_id: ProductVariantsId;

  quantity: number;

  unit_price: string;

  added_at: Date;
}

export interface CartItemsInitializer {
  id: CartItemsId;

  cart_id: ShoppingCartsId;

  product_variant_id: ProductVariantsId;

  quantity: number;

  unit_price: string;

  added_at?: Date;
}

export interface CartItemsMutator {
  id?: CartItemsId;

  cart_id?: ShoppingCartsId;

  product_variant_id?: ProductVariantsId;

  quantity?: number;

  unit_price?: string;

  added_at?: Date;
}
