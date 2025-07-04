import type Products from "@/schemas/public/Products";
import type Categories from "@/schemas/public/Categories";
import type { SellersId, SellersInitializer } from "@/schemas/public/Sellers";

export type Product = Omit<Products, "seller_id" | "category_id"> & {
  category?: Omit<
    Categories,
    "parent_category_id" | "is_active" | "created_at"
  >;
  seller?: Omit<SellersInitializer, "user_id" | "tax_id" | "created_at">;
  product_rating: number;
  product_review_count: number;
  total_stock: number;
  variant_count: number;
};

export type ProductsResponse = {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
};
