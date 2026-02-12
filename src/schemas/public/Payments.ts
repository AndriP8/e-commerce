import type { OrdersId } from "./Orders";
import type { UsersId } from "./Users";
import type { default as PaymentStatusEnum } from "./PaymentStatusEnum";

export type PaymentsId = string & { __brand: "public.payments" };

export default interface Payments {
  id: PaymentsId;

  order_id: OrdersId;

  user_id: UsersId;

  amount: string;

  payment_method: string;

  payment_provider: string;

  transaction_id: string | null;

  payment_status: PaymentStatusEnum;

  payment_date: Date;
}

export interface PaymentsInitializer {
  
  id: PaymentsId;

  order_id: OrdersId;

  user_id: UsersId;

  amount: string;

  payment_method: string;

  payment_provider: string;

  transaction_id?: string | null;

  payment_status: PaymentStatusEnum;

  payment_date?: Date;
}

export interface PaymentsMutator {
  id?: PaymentsId;

  order_id?: OrdersId;

  user_id?: UsersId;

  amount?: string;

  payment_method?: string;

  payment_provider?: string;

  transaction_id?: string | null;

  payment_status?: PaymentStatusEnum;

  payment_date?: Date;
}
