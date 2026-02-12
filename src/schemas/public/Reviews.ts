import type { ProductsId } from "./Products";
import type { UsersId } from "./Users";
import type { OrderItemsId } from "./OrderItems";

export type ReviewsId = string & { __brand: "public.reviews" };

export default interface Reviews {
  id: ReviewsId;

  product_id: ProductsId;

  user_id: UsersId;

  order_item_id: OrderItemsId;

  rating: number;

  review_text: string;

  is_verified_purchase: boolean;

  created_at: Date;

  updated_at: Date | null;
}

export interface ReviewsInitializer {
  id: ReviewsId;

  product_id: ProductsId;

  user_id: UsersId;

  order_item_id: OrderItemsId;

  rating: number;

  review_text: string;

  is_verified_purchase: boolean;

  created_at?: Date;

  updated_at?: Date | null;
}

export interface ReviewsMutator {
  id?: ReviewsId;

  product_id?: ProductsId;

  user_id?: UsersId;

  order_item_id?: OrderItemsId;

  rating?: number;

  review_text?: string;

  is_verified_purchase?: boolean;

  created_at?: Date;

  updated_at?: Date | null;
}
