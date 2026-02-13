import {
  Products,
  Categories,
  SellersInitializer,
  ProductVariants,
  Reviews,
  Users,
  ProductImages,
  Sellers,
  Currencies,
} from "@/schemas/db-schemas";

export type Product = Omit<Products, "seller_id" | "category_id"> & {
  category?: Omit<Categories, "parent_category_id" | "is_active" | "created_at">;
  seller?: Omit<SellersInitializer, "user_id" | "tax_id" | "created_at">;
  product_review_count: number;
  total_stock: number;
  variant_count: number;
};

export type ProductsResponse = {
  data: Omit<Product, "product_review_count" | "seller">[];
  currency: Currencies;
  pagination: {
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
};

export type ProductDetailResponse = {
  data: Product & {
    category: Pick<Categories, "id" | "name" | "description" | "image_url">;
    seller: Omit<Sellers, "user_id" | "tax_id" | "created_at">;
    rating: {
      average: number;
      count: number;
    };
    stock: {
      total_quantity: number;
      variant_count: number;
    };
    variants: Omit<ProductVariants, "product_id">[];
    reviews: (Omit<Reviews, "product_id" | "order_item_id"> &
      Pick<Users, "first_name" | "last_name">)[];
    images: Omit<ProductImages, "product_id" | "created_at">[];
  };
  currency: Currencies;
};
