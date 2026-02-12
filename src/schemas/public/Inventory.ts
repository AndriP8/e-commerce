import type { ProductVariantsId } from './ProductVariants';

export type InventoryId = string & { __brand: 'public.inventory' };

export default interface Inventory {
  id: InventoryId;

  product_variant_id: ProductVariantsId;

  quantity_available: number;

  quantity_reserved: number;

  reorder_level: number;

  last_updated: Date;
}

export interface InventoryInitializer {
  id: InventoryId;

  product_variant_id: ProductVariantsId;

  quantity_available: number;

  quantity_reserved: number;

  reorder_level: number;

  last_updated?: Date;
}

export interface InventoryMutator {
  id?: InventoryId;

  product_variant_id?: ProductVariantsId;

  quantity_available?: number;

  quantity_reserved?: number;

  reorder_level?: number;

  last_updated?: Date;
}
