import Orders from "@/schemas/public/Orders";
import OrderItems from "@/schemas/public/OrderItems";
import Shipments from "@/schemas/public/Shipments";
import Payments from "@/schemas/public/Payments";
import Currencies from "@/schemas/public/Currencies";

export type OrderDetail = Omit<
  Orders,
  "order_date" | "estimated_delivery" | "created_at" | "updated_at"
> & {
  order_date: string;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string | null;
  shipping_address: {
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    address_type: string;
  };
  payment_status: Pick<Payments, "payment_status">["payment_status"] | null;
  payment_method: Pick<Payments, "payment_method">["payment_method"] | null;
  payment_provider:
    | Pick<Payments, "payment_provider">["payment_provider"]
    | null;
  transaction_id: Pick<Payments, "transaction_id">["transaction_id"] | null;
};

export type OrderItemDetail = OrderItems & {
  product_name: string;
  image_url: string | null;
};

export type ShipmentDetail = Omit<
  Shipments,
  "shipping_date" | "delivered_date"
> & {
  shipping_date: string;
  delivered_date: string | null;
};

export type OrderDetailResponse = {
  data: {
    order: OrderDetail;
    items: OrderItemDetail[];
    shipment: ShipmentDetail | null;
  };
  currency: Currencies;
};
