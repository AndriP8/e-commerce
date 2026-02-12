export type CategoriesId = string & { __brand: 'public.categories' };

export default interface Categories {
  id: CategoriesId;

  name: string;

  description: string | null;

  parent_category_id: CategoriesId | null;

  image_url: string | null;

  is_active: boolean | null;

  created_at: Date;
}

export interface CategoriesInitializer {
  id: CategoriesId;

  name: string;

  description?: string | null;

  parent_category_id?: CategoriesId | null;

  image_url?: string | null;

  is_active?: boolean | null;

  created_at?: Date;
}

export interface CategoriesMutator {
  id?: CategoriesId;

  name?: string;

  description?: string | null;

  parent_category_id?: CategoriesId | null;

  image_url?: string | null;

  is_active?: boolean | null;

  created_at?: Date;
}
