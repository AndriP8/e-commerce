import type { ProductsId } from './Products';

export type ProductImagesId = string & { __brand: 'public.product_images' };

export default interface ProductImages {
  id: ProductImagesId;

  product_id: ProductsId;

  image_url: string;

  alt_text: string | null;

  is_primary: boolean | null;

  sort_order: number | null;

  created_at: Date;
}

export interface ProductImagesInitializer {
  id: ProductImagesId;

  product_id: ProductsId;

  image_url: string;

  alt_text?: string | null;

  is_primary?: boolean | null;

  sort_order?: number | null;

  created_at?: Date;
}

export interface ProductImagesMutator {
  id?: ProductImagesId;

  product_id?: ProductsId;

  image_url?: string;

  alt_text?: string | null;

  is_primary?: boolean | null;

  sort_order?: number | null;

  created_at?: Date;
}
