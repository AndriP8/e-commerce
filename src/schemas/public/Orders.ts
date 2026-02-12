import type { UsersId } from "./Users";
import type { default as OrderStatusEnum } from "./OrderStatusEnum";

export type OrdersId = string & { __brand: "public.orders" };

export default interface Orders {
  id: OrdersId;

  user_id: UsersId;

  order_number: string;

  subtotal: string;

  tax_amount: string;

  shipping_amount: string;

  discount_amount: string;

  total_amount: string;

  order_status: OrderStatusEnum;

  order_date: Date;

  estimated_delivery: Date | null;

  shipping_address: unknown;

  billing_address: unknown;

  created_at: Date;

  updated_at: Date | null;

  currency_code: string | null;
}

export interface OrdersInitializer {
  
  id: OrdersId;

  user_id: UsersId;

  order_number: string;

  subtotal: string;

  tax_amount: string;

  shipping_amount: string;

  discount_amount: string;

  total_amount: string;

  order_status: OrderStatusEnum;

  order_date?: Date;

  estimated_delivery?: Date | null;

  shipping_address: unknown;

  billing_address: unknown;

  created_at?: Date;

  updated_at?: Date | null;

  currency_code?: string | null;
}

export interface OrdersMutator {
  id?: OrdersId;

  user_id?: UsersId;

  order_number?: string;

  subtotal?: string;

  tax_amount?: string;

  shipping_amount?: string;

  discount_amount?: string;

  total_amount?: string;

  order_status?: OrderStatusEnum;

  order_date?: Date;

  estimated_delivery?: Date | null;

  shipping_address?: unknown;

  billing_address?: unknown;

  created_at?: Date;

  updated_at?: Date | null;

  currency_code?: string | null;
}
