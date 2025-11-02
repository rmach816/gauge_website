// ============================================
// ENUMS
// ============================================

export enum Occasion {
  BUSINESS_DINNER = 'Business Dinner',
  WEDDING_GUEST = 'Wedding Guest',
  JOB_INTERVIEW = 'Job Interview',
  FIRST_DATE = 'First Date',
  CASUAL = 'Casual',
  FORMAL = 'Formal Event',
}

export enum StylePreference {
  CONSERVATIVE = 'Conservative',
  MODERN = 'Modern',
  STYLISH = 'Stylish',
  FASHION_FORWARD = 'Fashion-Forward',
}

export enum MatchRating {
  GREAT = 'great',
  OKAY = 'okay',
  POOR = 'poor',
}

export enum GarmentType {
  SHIRT = 'Shirt',
  PANTS = 'Pants',
  JACKET = 'Jacket',
  SHOES = 'Shoes',
  ACCESSORIES = 'Accessories',
}

export enum PriceRange {
  BUDGET = 'budget',
  MID = 'mid',
  PREMIUM = 'premium',
}

// ============================================
// USER DATA
// ============================================

export interface UserMeasurements {
  height: number;              // inches
  weight: number;              // pounds  
  chest: number;               // inches
  waist: number;               // inches
  inseam: number;              // inches
  neck: number;                // inches
  sleeve: number;              // inches
  shoulder: number;            // inches
  preferredFit: 'slim' | 'regular' | 'relaxed';
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  measurements?: UserMeasurements;
  stylePreference: StylePreference;
  favoriteOccasions: Occasion[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CLOSET & ITEMS
// ============================================

export interface ClosetItem {
  id: string;
  imageUri: string;
  garmentType: GarmentType;
  color: string;
  brand?: string;
  notes?: string;
  addedAt: string;
}

// ============================================
// ANALYSIS RESULTS
// ============================================

export interface MatchCheckResult {
  id: string;
  imageUris: string[];
  rating: MatchRating;
  analysis: string;
  suggestions: Suggestion[];
  occasion?: Occasion;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  garmentType: GarmentType;
  description: string;
  reasoning: string;
  colors?: string[];
  styles?: string[];
}

export interface SizeRecommendation {
  garmentType: GarmentType;
  recommendedSize: string;
  fitNotes: string[];
  tailoringTips?: string[];
}

// ============================================
// SHOPPING
// ============================================

export interface ShoppingItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  affiliateLink: string;
  retailer: string;
  garmentType: GarmentType;
  sizes?: string[];
  recommendedSize?: string;
  priceRange: PriceRange;
}

export interface CompleteOutfit {
  id: string;
  occasion: Occasion;
  stylePreference: StylePreference;
  items: OutfitItem[];
  totalPrice: number;
  createdAt: string;
}

export interface OutfitItem {
  garmentType: GarmentType;
  description: string;
  shoppingOptions?: ShoppingItem[];
  existingItem?: ClosetItem;
  colors?: string[];
  styles?: string[];
  shoppingKeywords?: string[];
}

// ============================================
// HISTORY & PREMIUM
// ============================================

export interface CheckHistory {
  id: string;
  type: 'instant-check' | 'outfit-builder' | 'closet-match';
  result: MatchCheckResult | CompleteOutfit;
  createdAt: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  purchaseDate?: string;
  expiryDate?: string;
  checksRemaining?: number;
}

// ============================================
// API TYPES
// ============================================

export interface ClaudeVisionRequest {
  imageBase64: string[];
  userMeasurements?: UserMeasurements;
  occasion?: Occasion;
  stylePreference?: StylePreference;
  existingItems?: string[];
  requestType: 'instant-check' | 'outfit-builder' | 'closet-match' | 'find-to-match';
}

export interface ClaudeVisionResponse {
  rating?: MatchRating;
  analysis: string;
  suggestions: Suggestion[];
  sizeRecommendations?: SizeRecommendation[];
  completeOutfit?: OutfitItem[];
}

// ============================================
// NAVIGATION
// ============================================

export type RootStackParamList = {
  MainTabs: undefined;
  Result: { checkId: string };
  Paywall: undefined;
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  Closet: undefined;
  Shop: undefined;
  Profile: undefined;
};

