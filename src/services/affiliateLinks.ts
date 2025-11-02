import { ShoppingItem, GarmentType, PriceRange } from '../types';
import { AMAZON_AFFILIATE_TAG, NORDSTROM_AFFILIATE_ID } from '@env';
import uuid from 'react-native-uuid';

interface SearchParams {
  garmentType: GarmentType;
  description: string;
  colors?: string[];
  priceRange: PriceRange;
}

export const AffiliateLinkService = {
  generateAmazonLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const tag = AMAZON_AFFILIATE_TAG || 'default-tag';
    return `https://www.amazon.com/s?k=${encoded}&tag=${tag}`;
  },

  generateNordstromLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    const id = NORDSTROM_AFFILIATE_ID || 'default-id';
    return `https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${encoded}&affiliateId=${id}`;
  },

  generateJCrewLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    return `https://www.jcrew.com/search?q=${encoded}`;
  },

  generateBonobosLink(searchTerm: string): string {
    const encoded = encodeURIComponent(searchTerm);
    return `https://bonobos.com/search?q=${encoded}`;
  },

  buildSearchTerm(params: SearchParams): string {
    const { garmentType, description, colors } = params;
    
    let terms = [`men's ${garmentType.toLowerCase()}`];
    terms.push(description.toLowerCase());
    
    if (colors && colors.length > 0) {
      terms.push(colors[0].toLowerCase());
    }
    
    return terms.join(' ');
  },

  generateShoppingOptions(params: SearchParams): ShoppingItem[] {
    const searchTerm = this.buildSearchTerm(params);
    const { garmentType, description, priceRange } = params;
    
    const options: ShoppingItem[] = [];
    
    // Amazon
    options.push({
      id: uuid.v4() as string,
      name: description,
      brand: 'Various Brands',
      price: 0,
      imageUrl: '',
      affiliateLink: this.generateAmazonLink(searchTerm),
      retailer: 'Amazon',
      garmentType,
      priceRange,
    });
    
    // Nordstrom
    options.push({
      id: uuid.v4() as string,
      name: description,
      brand: 'Various Brands',
      price: 0,
      imageUrl: '',
      affiliateLink: this.generateNordstromLink(searchTerm),
      retailer: 'Nordstrom',
      garmentType,
      priceRange,
    });
    
    // J.Crew
    if (priceRange !== PriceRange.PREMIUM) {
      options.push({
        id: uuid.v4() as string,
        name: description,
        brand: 'J.Crew',
        price: 0,
        imageUrl: '',
        affiliateLink: this.generateJCrewLink(searchTerm),
        retailer: 'J.Crew',
        garmentType,
        priceRange,
      });
    }
    
    // Bonobos
    if (priceRange !== PriceRange.BUDGET) {
      options.push({
        id: uuid.v4() as string,
        name: description,
        brand: 'Bonobos',
        price: 0,
        imageUrl: '',
        affiliateLink: this.generateBonobosLink(searchTerm),
        retailer: 'Bonobos',
        garmentType,
        priceRange,
      });
    }
    
    return options;
  },
};

