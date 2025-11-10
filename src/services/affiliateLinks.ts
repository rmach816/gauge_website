import { ShoppingItem, GarmentType, PriceRange } from '../types';
import { 
  AMAZON_AFFILIATE_TAG, 
  NORDSTROM_AFFILIATE_ID,
  JCREW_AFFILIATE_ID,
  BONOBOS_AFFILIATE_ID,
  MRPORTER_AFFILIATE_ID,
  ASOS_AFFILIATE_ID,
  TARGET_AFFILIATE_ID,
  UNIQLO_AFFILIATE_ID,
  SUITSUPPLY_AFFILIATE_ID,
  EXPRESS_AFFILIATE_ID,
} from '@env';
import uuid from 'react-native-uuid';

interface SearchParams {
  garmentType: GarmentType;
  description: string;
  colors?: string[];
  priceRange: PriceRange;
  size?: string; // e.g., "M", "42", "16/34"
  specificStyle?: string; // e.g., "slim fit", "oxford"
}

export const AffiliateLinkService = {
  generateAmazonLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const tag = AMAZON_AFFILIATE_TAG || 'default-tag';
    
    // Amazon simple search with men's department filter
    let url = `https://www.amazon.com/s?k=${encoded}&tag=${tag}`;
    url += '&rh=n:7141123011'; // Men's Clothing department
    
    return url;
  },

  generateNordstromLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = NORDSTROM_AFFILIATE_ID || 'default-id';
    
    // Nordstrom simple search
    return `https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${encoded}&affiliateId=${id}`;
  },

  generateJCrewLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = JCREW_AFFILIATE_ID || '';
    
    // J.Crew simple search (detailed terms, no size/price)
    return `https://www.jcrew.com/search?q=${encoded}${id ? `&cjdata=${id}` : ''}`;
  },

  generateBonobosLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = BONOBOS_AFFILIATE_ID || '';
    
    return `https://bonobos.com/shop?q=${encoded}${id ? `&cjdata=${id}` : ''}`;
  },

  generateMrPorterLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = MRPORTER_AFFILIATE_ID || '';
    
    return `https://www.mrporter.com/en-us/mens/search/${encoded}${id ? `?awc=${id}` : ''}`;
  },

  generateAsosLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = ASOS_AFFILIATE_ID || '';
    
    return `https://www.asos.com/us/men/search/?q=${encoded}${id ? `&awc=${id}` : ''}`;
  },

  generateTargetLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = TARGET_AFFILIATE_ID || '';
    
    // Target with men's category filter
    let url = `https://www.target.com/s?searchTerm=${encoded}${id ? `&cjdata=${id}` : ''}`;
    url += '&category=5xtld'; // Men's Clothing category
    
    return url;
  },

  generateUniqloLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = UNIQLO_AFFILIATE_ID || '';
    
    return `https://www.uniqlo.com/us/en/men?q=${encoded}${id ? `&cjdata=${id}` : ''}`;
  },

  generateSuitSupplyLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = SUITSUPPLY_AFFILIATE_ID || '';
    return `https://suitsupply.com/en-us/search?q=${encoded}${id ? `&affiliateid=${id}` : ''}`;
  },

  generateExpressLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = EXPRESS_AFFILIATE_ID || '';
    return `https://www.express.com/mens-clothing/search/${encoded}${id ? `?cjdata=${id}` : ''}`;
  },

  buildSearchTerm(params: SearchParams): string {
    const { garmentType, description, colors } = params;
    
    let terms: string[] = [];
    
    // Start with "men" (without possessive - cleaner for URLs)
    terms.push('men');
    
    // Parse description to extract key garment details
    const desc = description?.toLowerCase() || '';
    
    // Extract specific garment type from description (sweater, polo, etc.)
    const specificGarments = ['sweater', 'polo', 'tee', 't-shirt', 'hoodie', 'cardigan', 
                              'blazer', 'jacket', 'coat', 'chinos', 'jeans', 'dress shirt',
                              'oxford', 'henley', 'bomber', 'parka', 'peacoat'];
    
    let foundSpecific = false;
    for (const garment of specificGarments) {
      if (desc.includes(garment)) {
        terms.push(garment.replace('-', ' '));
        foundSpecific = true;
        break;
      }
    }
    
    // If no specific garment found, use generic type
    if (!foundSpecific) {
      terms.push(garmentType.toLowerCase());
    }
    
    // Add color if specified (very important for search relevance)
    if (colors && colors.length > 0) {
      // Clean up color names (e.g., "charcoal gray" -> "gray")
      const color = colors[0].toLowerCase();
      if (color.includes('gray') || color.includes('grey')) {
        terms.push('gray');
      } else if (color.includes('blue')) {
        terms.push('blue');
      } else if (color.includes('black')) {
        terms.push('black');
      } else if (color.includes('white')) {
        terms.push('white');
      } else if (color.includes('navy')) {
        terms.push('navy');
      } else {
        // Use first word of color
        terms.push(color.split(' ')[0]);
      }
    }
    
    // Add style hints for better results
    if (desc.includes('crew neck')) {
      terms.push('crew neck');
    } else if (desc.includes('v-neck') || desc.includes('v neck')) {
      terms.push('v-neck');
    } else if (desc.includes('button') && !desc.includes('button-down')) {
      terms.push('button');
    }
    
    // REMOVED: Size specifications (breaks searches)
    // REMOVED: Price ranges (too restrictive)
    
    return terms.join(' ');
  },

  generateShoppingOptions(params: SearchParams): ShoppingItem[] {
    const searchTerm = this.buildSearchTerm(params);
    const { garmentType, description, priceRange } = params;
    
    console.log('[AffiliateLinkService] generateShoppingOptions called with:', {
      garmentType,
      priceRange,
      searchTerm, // Show the generated search term
    });
    
    const options: ShoppingItem[] = [];
    
    // Helper function to create shopping item
    const createItem = (retailer: string, link: string): ShoppingItem => ({
      id: uuid.v4() as string,
      name: description,
      brand: retailer === 'J.Crew' || retailer === 'Bonobos' || retailer === 'Uniqlo' ? retailer : 'Various Brands',
      price: 0,
      imageUrl: '',
      affiliateLink: link,
      retailer,
      garmentType,
      priceRange,
      searchTerm,
    });
    
    console.log('[AffiliateLinkService] Adding all retailers (user can rotate through them)');
    
    // ALWAYS include ALL retailers regardless of price range
    // User can cycle through different options with "Show More Retailers" button
    options.push(createItem('Amazon', this.generateAmazonLink(searchTerm)));
    options.push(createItem('Nordstrom', this.generateNordstromLink(searchTerm)));
    options.push(createItem('J.Crew', this.generateJCrewLink(searchTerm)));
    options.push(createItem('Bonobos', this.generateBonobosLink(searchTerm)));
    options.push(createItem('Target', this.generateTargetLink(searchTerm)));
    options.push(createItem('Uniqlo', this.generateUniqloLink(searchTerm)));
    options.push(createItem('ASOS', this.generateAsosLink(searchTerm)));
    options.push(createItem('Express', this.generateExpressLink(searchTerm)));
    options.push(createItem('Mr Porter', this.generateMrPorterLink(searchTerm)));
    
    // SuitSupply - only for formal items
    const formalTypes = ['SUIT', 'DRESS_SHIRT', 'BLAZER', 'DRESS_PANTS', 'TIE', 'SHIRT'];
    if (formalTypes.includes(garmentType.toUpperCase())) {
      options.push(createItem('SuitSupply', this.generateSuitSupplyLink(searchTerm)));
    }
    
    console.log('[AffiliateLinkService] Returning', options.length, 'total retailer options');
    return options;
  },
};
