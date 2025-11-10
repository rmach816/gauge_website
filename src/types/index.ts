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
  STREET = 'Street',
}

export enum MatchRating {
  GREAT = 'great',
  OKAY = 'okay',
  POOR = 'poor',
}

export enum GarmentType {
  SHIRT = 'Shirt',
  DRESS_SHIRT = 'Dress Shirt',
  HENLEY = 'Henley',
  PANTS = 'Pants',
  JACKET = 'Jacket',
  BLAZER = 'Blazer',
  SUIT = 'Suit',
  COAT = 'Coat',
  VEST = 'Vest',
  SWEATER = 'Sweater',
  HOODIE = 'Hoodie',
  T_SHIRT = 'T-Shirt',
  POLO = 'Polo',
  CHINOS = 'Chinos',
  JEANS = 'Jeans',
  SHORTS = 'Shorts',
  SHOES = 'Shoes',
  BOOTS = 'Boots',
  DRESS_SHOES = 'Dress Shoes',
  LOAFERS = 'Loafers',
  SNEAKERS = 'Sneakers',
  ACCESSORIES = 'Accessories',
  TIE = 'Tie',
  BELT = 'Belt',
  WATCH = 'Watch',
  HAT = 'Hat',
}

export enum PriceRange {
  BUDGET = 'budget',
  MID = 'mid',
  PREMIUM = 'premium',
}

export type OutfitMode = 'wardrobe' | 'shopping' | 'mixed';

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
  lastName?: string;                     // User's last name (for "Mr. [LastName]" greeting - formal, premium)
  measurements?: UserMeasurements;
  shoeSize?: string;            // NEW: US size or international
  stylePreference: StylePreference[];  // Updated: array for multi-select
  favoriteOccasions: Occasion[];
  budgetSettings?: BudgetSettings; // NEW
  language?: string;             // NEW
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSettings {
  maxItemPrice?: number;
  maxOutfitPrice?: number;
  preferredPriceRange: PriceRange;
  preferredRetailers?: string[];
}

// ============================================
// ONBOARDING STATE
// ============================================

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  skippedAll?: boolean;          // NEW: tracks if user skipped all setup
  completedSteps: string[];
  skippedSteps: string[];
  currentStep?: number;
  measurements?: Partial<UserMeasurements>;
  shoeSize?: string;
  stylePreferences?: StylePreference[];
  wardrobePhotos?: string[]; // URIs of photos added during onboarding
}

// ============================================
// CLOSET & ITEMS
// ============================================

export interface ClosetItem {
  id: string;
  imageUri: string;
  garmentType: GarmentType;
  color: string; // Primary color
  secondaryColor?: string; // For reversible items (e.g., reversible belts: black/brown)
  size?: string; // General size (e.g., "M", "L", "10", "42R") - kept for backward compatibility
  sizeDetails?: GarmentSizeDetails; // NEW: Detailed size information by garment type
  material?: string; // NEW: Material (e.g., "cotton", "wool", "linen", "synthetic")
  pattern?: string; // NEW: Pattern (e.g., "solid", "striped", "checked", "paisley", "polka dot")
  brand?: string;
  notes?: string;
  addedAt: string;
}

// NEW: Detailed size information based on garment type
export interface GarmentSizeDetails {
  // For Shirts, T-Shirts, Polos, Sweaters
  shirtSize?: string; // "S", "M", "L", "XL", etc.
  neckSize?: string; // "15", "15.5", "16", etc. (inches)
  sleeveLength?: string; // "32", "33", "34", etc. (inches)
  
  // For Pants, Chinos, Jeans, Shorts
  waistSize?: string; // "30", "32", "34", etc. (inches)
  inseamLength?: string; // "30", "32", "34", etc. (inches)
  
  // For Jackets, Blazers, Suits
  jacketSize?: string; // "38R", "40L", "42R", etc.
  chestSize?: string; // "38", "40", "42", etc. (inches)
  
  // For Shoes, Boots, Dress Shoes, Sneakers
  shoeSize?: string; // "9", "10", "10.5", etc. (US size)
  shoeWidth?: string; // "D", "E", "EE", etc.
  
  // For Accessories (Ties, Belts, etc.)
  accessorySize?: string; // Generic size for accessories
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
  searchTerm?: string; // Search keywords used to generate this link (IMPORTANT FIX #5)
}

export interface CompleteOutfit {
  id: string;
  occasion: Occasion | string; // Allows custom occasions
  stylePreference: StylePreference;
  items: OutfitItem[];
  totalPrice: number;
  createdAt: string;
}

export interface FavoriteOutfit {
  id: string;
  name?: string; // User can name their favorite outfit
  outfit: CompleteOutfit;
  savedAt: string;
  notes?: string; // Optional user notes about this outfit
}

export interface OutfitItem {
  garmentType: GarmentType;
  description: string;
  shoppingOptions?: ShoppingItem[];
  existingItem?: ClosetItem;
  colors?: string[];
  styles?: string[];
  shoppingKeywords?: string[];
  priceRange?: PriceRange;
}

// ============================================
// HISTORY & PREMIUM
// ============================================

export interface CheckHistory {
  id: string;
  type: 'instant-check' | 'outfit-builder' | 'closet-match' | 'chat-session';
  result: MatchCheckResult | CompleteOutfit | ChatSession;
  createdAt: string;
}

// ============================================
// CHAT FEATURE
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    imageUri?: string;
  }>;
  wardrobeItems?: ClosetItem[]; // Selected wardrobe items attached to this message
  timestamp: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  startedAt: string;
  lastMessageAt: string;
  active: boolean;
}

export interface PremiumStatus {
  isPremium: boolean;
  purchaseDate?: string;
  expiryDate?: string;
  checksRemaining?: number;
  freeChatMessagesUsed?: number; // Track free chat messages used (0-3 for trial)
}

// ============================================
// API TYPES
// ============================================

export interface ClaudeVisionRequest {
  imageBase64: string[];
  userMeasurements?: UserMeasurements;
  occasion?: Occasion | string; // Allows custom occasions like "Christmas party"
  stylePreference?: StylePreference;
  shoeSize?: string; // User's shoe size for shoe recommendations
  existingItems?: string[]; // Deprecated: use wardrobeItems instead
  wardrobeItems?: ClosetItem[]; // Full wardrobe items for outfit building
  priceRange?: PriceRange;
  requestType: 'instant-check' | 'outfit-builder' | 'closet-match' | 'find-to-match' | 'wardrobe-outfit' | 'shopping-outfit' | 'mixed-outfit' | 'wardrobe-categorization' | 'item-regeneration';
  garmentTypeToRegenerate?: GarmentType; // For item-regeneration: which garment type to regenerate
  currentOutfitContext?: Array<{ // For item-regeneration: context of current outfit
    garmentType: GarmentType;
    description: string;
    existingItem?: string; // Item ID if from wardrobe
  }>;
}

export interface ClaudeVisionResponse {
  rating?: MatchRating;
  analysis: string;
  suggestions: Suggestion[];
  sizeRecommendations?: SizeRecommendation[];
  completeOutfit?: OutfitItem[];
  photoQuality?: 'good' | 'poor'; // For wardrobe-categorization: photo quality assessment
  photoQualityFeedback?: string; // Specific feedback if quality is poor
}

// ============================================
// NAVIGATION
// ============================================

export type RootStackParamList = {
  MainTabs: { screen?: keyof TabParamList } | undefined;
  Result: { checkId: string };
  Paywall: undefined;
  Welcome: undefined;
  NameInput: undefined;
  Greeting: undefined;
  MeasurementSelection: undefined;
  MeasurementStep: { measurementType: string; stepNumber: number; totalSteps: number };
  StylePreferences: undefined;
  ShoeSize: undefined;
  WardrobePhoto: undefined;
  Completion: undefined;
  Tutorial: undefined;
  QuickStyleCheck: undefined;
  BuildOutfit: undefined;
  AddClosetItem: undefined;
  EditClosetItem: { itemId: string };
  Chat: undefined;
  Settings: undefined;
  PrivacyPolicy: undefined;
  ItemShopping: { outfitItem: OutfitItem };
  OutfitGenerating: {
    occasion: Occasion | string;
    mode: 'wardrobe' | 'shopping' | 'mixed';
    priceRange?: PriceRange;
  };
  Favorites: undefined;
  ViewFavorite: { favoriteId: string };
  RegenerateItem: {
    outfit: CompleteOutfit;
    itemIndex: number;
    checkId: string; // To update the history entry
  };
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  Closet: undefined;
  Shop: undefined;
  Profile: undefined;
};

