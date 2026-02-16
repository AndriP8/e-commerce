import type {
  CartItems,
  Categories,
  Currencies,
  Products,
  ProductVariants,
  ShoppingCarts,
  Users,
} from "@/schemas/db-schemas";

export type addToCartBody = {
  product_id: string;
  quantity: number;
};

type CartItem = {
  id: CartItems["id"];
  product_id: Products["id"];
  product_name: Products["name"];
  image_url: Categories["image_url"];
  variant_id: ProductVariants["id"];
  quantity: CartItems["quantity"];
  unit_price: CartItems["unit_price"];
  total_price: CartItems["unit_price"];
  added_at: CartItems["added_at"];
};
export type GetCartResponse = {
  data: {
    cart_id: ShoppingCarts["id"];
    user_id: Users["id"];
    items: CartItem[];
    total_price: number;
    item_count: number;
  };
  currency: Currencies;
};
