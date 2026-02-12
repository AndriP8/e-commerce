import type { ProductsId } from './Products';

export type ProductAttributesId = string & { __brand: 'public.product_attributes' };

export default interface ProductAttributes {
  id: ProductAttributesId;

  product_id: ProductsId;

  attribute_name: string;

  attribute_value: string;

  attribute_type: string;
}

export interface ProductAttributesInitializer {
  id: ProductAttributesId;

  product_id: ProductsId;

  attribute_name: string;

  attribute_value: string;

  attribute_type: string;
}

export interface ProductAttributesMutator {
  id?: ProductAttributesId;

  product_id?: ProductsId;

  attribute_name?: string;

  attribute_value?: string;

  attribute_type?: string;
}
