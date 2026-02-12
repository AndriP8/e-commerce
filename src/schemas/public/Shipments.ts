import type { OrdersId } from "./Orders";
import type { default as ShipmentStatusEnum } from "./ShipmentStatusEnum";

export type ShipmentsId = string & { __brand: "public.shipments" };

export default interface Shipments {
  id: ShipmentsId;

  order_id: OrdersId;

  shipment_status: ShipmentStatusEnum;

  carrier: string;

  shipping_date: Date;

  delivered_date: Date | null;

  tracking_details: unknown;
}

export interface ShipmentsInitializer {
  
  id: ShipmentsId;

  order_id: OrdersId;

  shipment_status: ShipmentStatusEnum;

  carrier: string;

  shipping_date?: Date;

  delivered_date?: Date | null;

  tracking_details: unknown;
}

export interface ShipmentsMutator {
  id?: ShipmentsId;

  order_id?: OrdersId;

  shipment_status?: ShipmentStatusEnum;

  carrier?: string;

  shipping_date?: Date;

  delivered_date?: Date | null;

  tracking_details?: unknown;
}
