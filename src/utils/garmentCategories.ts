import { GarmentType } from '../types';

/**
 * Master categories for organizing garment types
 * Used for filtering and UI organization
 */
export enum GarmentCategory {
  SHIRTS = 'Shirts',
  PANTS = 'Pants',
  JACKETS = 'Jackets',
  SHOES = 'Shoes',
  HATS = 'Hats',
  ACCESSORIES = 'Accessories',
}

/**
 * Maps garment types to their master categories
 */
export const GARMENT_TO_CATEGORY: Record<GarmentType, GarmentCategory> = {
  [GarmentType.SHIRT]: GarmentCategory.SHIRTS,
  [GarmentType.DRESS_SHIRT]: GarmentCategory.SHIRTS,
  [GarmentType.HENLEY]: GarmentCategory.SHIRTS,
  [GarmentType.T_SHIRT]: GarmentCategory.SHIRTS,
  [GarmentType.POLO]: GarmentCategory.SHIRTS,
  [GarmentType.SWEATER]: GarmentCategory.SHIRTS,
  [GarmentType.HOODIE]: GarmentCategory.SHIRTS,
  
  [GarmentType.PANTS]: GarmentCategory.PANTS,
  [GarmentType.CHINOS]: GarmentCategory.PANTS,
  [GarmentType.JEANS]: GarmentCategory.PANTS,
  [GarmentType.SHORTS]: GarmentCategory.PANTS,
  
  [GarmentType.JACKET]: GarmentCategory.JACKETS,
  [GarmentType.BLAZER]: GarmentCategory.JACKETS,
  [GarmentType.SUIT]: GarmentCategory.JACKETS,
  [GarmentType.COAT]: GarmentCategory.JACKETS,
  [GarmentType.VEST]: GarmentCategory.JACKETS,
  
  [GarmentType.SHOES]: GarmentCategory.SHOES,
  [GarmentType.BOOTS]: GarmentCategory.SHOES,
  [GarmentType.DRESS_SHOES]: GarmentCategory.SHOES,
  [GarmentType.LOAFERS]: GarmentCategory.SHOES,
  [GarmentType.SNEAKERS]: GarmentCategory.SHOES,
  
  [GarmentType.ACCESSORIES]: GarmentCategory.ACCESSORIES,
  [GarmentType.TIE]: GarmentCategory.ACCESSORIES,
  [GarmentType.BELT]: GarmentCategory.ACCESSORIES,
  [GarmentType.WATCH]: GarmentCategory.ACCESSORIES,
  [GarmentType.HAT]: GarmentCategory.HATS,
};

/**
 * Maps master categories to their garment types
 */
export const CATEGORY_TO_GARMENTS: Record<GarmentCategory, GarmentType[]> = {
  [GarmentCategory.SHIRTS]: [
    GarmentType.SHIRT,
    GarmentType.DRESS_SHIRT,
    GarmentType.HENLEY,
    GarmentType.T_SHIRT,
    GarmentType.POLO,
    GarmentType.SWEATER,
    GarmentType.HOODIE,
  ],
  [GarmentCategory.PANTS]: [
    GarmentType.PANTS,
    GarmentType.CHINOS,
    GarmentType.JEANS,
    GarmentType.SHORTS,
  ],
  [GarmentCategory.JACKETS]: [
    GarmentType.JACKET,
    GarmentType.BLAZER,
    GarmentType.SUIT,
    GarmentType.COAT,
    GarmentType.VEST,
  ],
  [GarmentCategory.SHOES]: [
    GarmentType.SHOES,
    GarmentType.BOOTS,
    GarmentType.DRESS_SHOES,
    GarmentType.LOAFERS,
    GarmentType.SNEAKERS,
  ],
  [GarmentCategory.HATS]: [
    GarmentType.HAT,
  ],
  [GarmentCategory.ACCESSORIES]: [
    GarmentType.ACCESSORIES,
    GarmentType.TIE,
    GarmentType.BELT,
    GarmentType.WATCH,
  ],
};

/**
 * Get the master category for a garment type
 */
export const getCategoryForGarment = (garmentType: GarmentType): GarmentCategory => {
  return GARMENT_TO_CATEGORY[garmentType];
};

/**
 * Get all garment types in a category
 */
export const getGarmentsInCategory = (category: GarmentCategory): GarmentType[] => {
  return CATEGORY_TO_GARMENTS[category];
};

/**
 * Check if a garment type belongs to a category
 */
export const isGarmentInCategory = (
  garmentType: GarmentType,
  category: GarmentCategory
): boolean => {
  return getCategoryForGarment(garmentType) === category;
};

