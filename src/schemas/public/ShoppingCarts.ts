import type { UsersId } from './Users';

export type ShoppingCartsId = string & { __brand: 'public.shopping_carts' };

export default interface ShoppingCarts {
  id: ShoppingCartsId;

  user_id: UsersId;

  created_at: Date;

  updated_at: Date | null;
}

export interface ShoppingCartsInitializer {
  id: ShoppingCartsId;

  user_id: UsersId;

  created_at?: Date;

  updated_at?: Date | null;
}

export interface ShoppingCartsMutator {
  id?: ShoppingCartsId;

  user_id?: UsersId;

  created_at?: Date;

  updated_at?: Date | null;
}
