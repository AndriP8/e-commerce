import type { OrdersId } from "./Orders";
import type { ProductVariantsId } from "./ProductVariants";
import type { SellersId } from "./Sellers";
import type { default as OrderStatusEnum } from "./OrderStatusEnum";

export type OrderItemsId = string & { __brand: "public.order_items" };

export default interface OrderItems {
  id: OrderItemsId;

  order_id: OrdersId;

  product_variant_id: ProductVariantsId;

  seller_id: SellersId;

  quantity: number;

  unit_price: string;

  total_price: string;

  item_status: OrderStatusEnum;
}

export interface OrderItemsInitializer {
  
  id: OrderItemsId;

  order_id: OrdersId;

  product_variant_id: ProductVariantsId;

  seller_id: SellersId;

  quantity: number;

  unit_price: string;

  total_price: string;

  item_status: OrderStatusEnum;
}

export interface OrderItemsMutator {
  id?: OrderItemsId;

  order_id?: OrdersId;

  product_variant_id?: ProductVariantsId;

  seller_id?: SellersId;

  quantity?: number;

  unit_price?: string;

  total_price?: string;

  item_status?: OrderStatusEnum;
}
