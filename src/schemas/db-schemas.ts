import { z } from "zod";

export const addressTypeEnumSchema = z.enum(['shipping', 'billing']);

export const orderStatusEnumSchema = z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']);

export const paymentStatusEnumSchema = z.enum(['pending', 'completed', 'failed', 'refunded']);

export const sellerAddressTypeSchema = z.enum(['business', 'warehouse', 'return']);

export const shipmentStatusEnumSchema = z.enum(['pending', 'in_transit', 'delivered', 'failed']);

export const userEnumSchema = z.enum(['buyer', 'seller', 'admin']);

export const schemaMigrationsSchema = z.object({
  version: z.string(),
  executed_at: z.date().nullable(),
});

export const schemaMigrationsInitializerSchema = schemaMigrationsSchema;

export const usersSchema = z.object({
  id: z.string(),
  email: z.string(),
  password_hash: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  phone: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  is_active: z.boolean().nullable(),
  user_type: userEnumSchema,
});

export const usersInitializerSchema = usersSchema;

export const userAddressesSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  address_line1: z.string(),
  address_line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  is_default: z.boolean().nullable(),
  address_type: addressTypeEnumSchema,
  created_at: z.date(),
});

export const userAddressesInitializerSchema = userAddressesSchema;

export const categoriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  parent_category_id: z.string().nullable(),
  image_url: z.string().nullable(),
  is_active: z.boolean().nullable(),
  created_at: z.date(),
});

export const categoriesInitializerSchema = categoriesSchema;

export const productVariantsSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  variant_name: z.string(),
  price: z.coerce.number(),
  sku: z.string(),
  stock_quantity: z.number(),
  variant_attributes: z.any(),
  is_active: z.boolean().nullable(),
});

export const productVariantsInitializerSchema = productVariantsSchema;

export const productsSchema = z.object({
  id: z.string(),
  seller_id: z.string(),
  category_id: z.string(),
  name: z.string(),
  description: z.string(),
  base_price: z.coerce.number(),
  sku: z.string(),
  brand: z.string().nullable(),
  weight: z.coerce.number().nullable(),
  dimensions: z.string().nullable(),
  is_active: z.boolean().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  slug: z.string(),
});

export const productsInitializerSchema = productsSchema;

export const productImagesSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  image_url: z.string(),
  alt_text: z.string().nullable(),
  is_primary: z.boolean().nullable(),
  sort_order: z.number().nullable(),
  created_at: z.date(),
});

export const productImagesInitializerSchema = productImagesSchema;

export const productAttributesSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  attribute_name: z.string(),
  attribute_value: z.string(),
  attribute_type: z.string(),
});

export const productAttributesInitializerSchema = productAttributesSchema;

export const shoppingCartsSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

export const shoppingCartsInitializerSchema = shoppingCartsSchema;

export const cartItemsSchema = z.object({
  id: z.string(),
  cart_id: z.string(),
  product_variant_id: z.string(),
  quantity: z.number(),
  unit_price: z.coerce.number(),
  added_at: z.date(),
});

export const cartItemsInitializerSchema = cartItemsSchema;

export const orderItemsSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  product_variant_id: z.string(),
  seller_id: z.string(),
  quantity: z.number(),
  unit_price: z.coerce.number(),
  total_price: z.coerce.number(),
  item_status: orderStatusEnumSchema,
});

export const orderItemsInitializerSchema = orderItemsSchema;

export const sellersSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  business_name: z.string(),
  business_type: z.string(),
  tax_id: z.string(),
  description: z.string().nullable(),
  logo_url: z.string().nullable(),
  rating: z.coerce.number(),
  total_reviews: z.number(),
  is_verified: z.boolean(),
  created_at: z.date(),
});

export const sellersInitializerSchema = sellersSchema;

export const paymentsSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  user_id: z.string(),
  amount: z.coerce.number(),
  payment_method: z.string(),
  payment_provider: z.string(),
  transaction_id: z.string().nullable(),
  payment_status: paymentStatusEnumSchema,
  payment_date: z.date(),
});

export const paymentsInitializerSchema = paymentsSchema;

export const ordersSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  order_number: z.string(),
  subtotal: z.coerce.number(),
  tax_amount: z.coerce.number(),
  shipping_amount: z.coerce.number(),
  discount_amount: z.coerce.number(),
  total_amount: z.coerce.number(),
  order_status: orderStatusEnumSchema,
  order_date: z.date(),
  estimated_delivery: z.date().nullable(),
  shipping_address: z.any(),
  billing_address: z.any(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  currency_code: z.string().nullable(),
});

export const ordersInitializerSchema = ordersSchema;

export const shippingMethodsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  base_costs: z.coerce.number(),
  estimated_days_min: z.number(),
  estimated_days_max: z.number(),
  is_active: z.boolean().nullable(),
});

export const shippingMethodsInitializerSchema = shippingMethodsSchema;

export const shipmentsSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  shipment_status: shipmentStatusEnumSchema,
  carrier: z.string(),
  shipping_date: z.date(),
  delivered_date: z.date().nullable(),
  tracking_details: z.any(),
});

export const shipmentsInitializerSchema = shipmentsSchema;

export const sellerAddressesSchema = z.object({
  id: z.string(),
  seller_id: z.string(),
  address_line1: z.string(),
  address_line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  address_type: sellerAddressTypeSchema,
});

export const sellerAddressesInitializerSchema = sellerAddressesSchema;

export const inventorySchema = z.object({
  id: z.string(),
  product_variant_id: z.string(),
  quantity_available: z.number(),
  quantity_reserved: z.number(),
  reorder_level: z.number(),
  last_updated: z.date(),
});

export const inventoryInitializerSchema = inventorySchema;

export const reviewsSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  user_id: z.string(),
  order_item_id: z.string(),
  rating: z.number(),
  review_text: z.string(),
  is_verified_purchase: z.boolean(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

export const reviewsInitializerSchema = reviewsSchema;

export const currenciesSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  locales: z.string(),
  decimal_places: z.number(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

export const currenciesInitializerSchema = currenciesSchema;

export const exchangeRatesSchema = z.object({
  id: z.string(),
  from_currency_id: z.string(),
  to_currency_id: z.string(),
  rate: z.coerce.number(),
  effective_date: z.date(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

export const exchangeRatesInitializerSchema = exchangeRatesSchema;

export const userPreferencesSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  preferred_currency_id: z.string(),
  language: z.string().nullable(),
  timezone: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

export const userPreferencesInitializerSchema = userPreferencesSchema;

export type AddressTypeEnum = z.infer<typeof addressTypeEnumSchema>;
export type OrderStatusEnum = z.infer<typeof orderStatusEnumSchema>;
export type PaymentStatusEnum = z.infer<typeof paymentStatusEnumSchema>;
export type SellerAddressType = z.infer<typeof sellerAddressTypeSchema>;
export type ShipmentStatusEnum = z.infer<typeof shipmentStatusEnumSchema>;
export type UserEnum = z.infer<typeof userEnumSchema>;
export type SchemaMigrations = z.infer<typeof schemaMigrationsSchema>;
export type SchemaMigrationsInitializer = z.infer<typeof schemaMigrationsInitializerSchema>;
export type Users = z.infer<typeof usersSchema>;
export type UsersInitializer = z.infer<typeof usersInitializerSchema>;
export type UserAddresses = z.infer<typeof userAddressesSchema>;
export type UserAddressesInitializer = z.infer<typeof userAddressesInitializerSchema>;
export type Categories = z.infer<typeof categoriesSchema>;
export type CategoriesInitializer = z.infer<typeof categoriesInitializerSchema>;
export type ProductVariants = z.infer<typeof productVariantsSchema>;
export type ProductVariantsInitializer = z.infer<typeof productVariantsInitializerSchema>;
export type Products = z.infer<typeof productsSchema>;
export type ProductsInitializer = z.infer<typeof productsInitializerSchema>;
export type ProductImages = z.infer<typeof productImagesSchema>;
export type ProductImagesInitializer = z.infer<typeof productImagesInitializerSchema>;
export type ProductAttributes = z.infer<typeof productAttributesSchema>;
export type ProductAttributesInitializer = z.infer<typeof productAttributesInitializerSchema>;
export type ShoppingCarts = z.infer<typeof shoppingCartsSchema>;
export type ShoppingCartsInitializer = z.infer<typeof shoppingCartsInitializerSchema>;
export type CartItems = z.infer<typeof cartItemsSchema>;
export type CartItemsInitializer = z.infer<typeof cartItemsInitializerSchema>;
export type OrderItems = z.infer<typeof orderItemsSchema>;
export type OrderItemsInitializer = z.infer<typeof orderItemsInitializerSchema>;
export type Sellers = z.infer<typeof sellersSchema>;
export type SellersInitializer = z.infer<typeof sellersInitializerSchema>;
export type Payments = z.infer<typeof paymentsSchema>;
export type PaymentsInitializer = z.infer<typeof paymentsInitializerSchema>;
export type Orders = z.infer<typeof ordersSchema>;
export type OrdersInitializer = z.infer<typeof ordersInitializerSchema>;
export type ShippingMethods = z.infer<typeof shippingMethodsSchema>;
export type ShippingMethodsInitializer = z.infer<typeof shippingMethodsInitializerSchema>;
export type Shipments = z.infer<typeof shipmentsSchema>;
export type ShipmentsInitializer = z.infer<typeof shipmentsInitializerSchema>;
export type SellerAddresses = z.infer<typeof sellerAddressesSchema>;
export type SellerAddressesInitializer = z.infer<typeof sellerAddressesInitializerSchema>;
export type Inventory = z.infer<typeof inventorySchema>;
export type InventoryInitializer = z.infer<typeof inventoryInitializerSchema>;
export type Reviews = z.infer<typeof reviewsSchema>;
export type ReviewsInitializer = z.infer<typeof reviewsInitializerSchema>;
export type Currencies = z.infer<typeof currenciesSchema>;
export type CurrenciesInitializer = z.infer<typeof currenciesInitializerSchema>;
export type ExchangeRates = z.infer<typeof exchangeRatesSchema>;
export type ExchangeRatesInitializer = z.infer<typeof exchangeRatesInitializerSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UserPreferencesInitializer = z.infer<typeof userPreferencesInitializerSchema>;
