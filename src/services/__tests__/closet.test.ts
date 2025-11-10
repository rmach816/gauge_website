import { ClosetService } from '../closet';
import { StorageService } from '../storage';
import { ClosetItem, GarmentType, GarmentCategory } from '../../types';

// Mock StorageService
jest.mock('../storage');

describe('ClosetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClosetItems', () => {
    it('should return all closet items', async () => {
      const mockItems: ClosetItem[] = [
        {
          id: '1',
          garmentType: GarmentType.SHIRT,
          color: 'blue',
          imageUri: 'file://test1.jpg',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          garmentType: GarmentType.PANTS,
          color: 'black',
          imageUri: 'file://test2.jpg',
          createdAt: new Date().toISOString(),
        },
      ];

      (StorageService.getClosetItems as jest.Mock).mockResolvedValue(mockItems);

      const items = await ClosetService.getClosetItems();
      expect(items).toEqual(mockItems);
    });
  });

  describe('addItem', () => {
    it('should add a new item to the closet', async () => {
      const existingItems: ClosetItem[] = [];
      const newItem: ClosetItem = {
        id: '1',
        garmentType: GarmentType.SHIRT,
        color: 'blue',
        imageUri: 'file://test.jpg',
        createdAt: new Date().toISOString(),
      };

      (StorageService.getClosetItems as jest.Mock).mockResolvedValue(existingItems);
      (StorageService.saveClosetItems as jest.Mock).mockResolvedValue(undefined);

      await ClosetService.addItem(newItem);

      expect(StorageService.saveClosetItems).toHaveBeenCalledWith([newItem]);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the closet', async () => {
      const items: ClosetItem[] = [
        { id: '1', garmentType: GarmentType.SHIRT, color: 'blue', imageUri: 'file://test1.jpg', createdAt: new Date().toISOString() },
        { id: '2', garmentType: GarmentType.PANTS, color: 'black', imageUri: 'file://test2.jpg', createdAt: new Date().toISOString() },
      ];

      (StorageService.getClosetItems as jest.Mock).mockResolvedValue(items);
      (StorageService.saveClosetItems as jest.Mock).mockResolvedValue(undefined);

      await ClosetService.removeItem('1');

      expect(StorageService.saveClosetItems).toHaveBeenCalledWith([items[1]]);
    });
  });

  describe('searchItems', () => {
    it('should filter items by search query', async () => {
      const items: ClosetItem[] = [
        { id: '1', garmentType: GarmentType.SHIRT, color: 'blue', imageUri: 'file://test1.jpg', createdAt: new Date().toISOString() },
        { id: '2', garmentType: GarmentType.PANTS, color: 'black', imageUri: 'file://test2.jpg', createdAt: new Date().toISOString() },
        { id: '3', garmentType: GarmentType.SHIRT, color: 'red', brand: 'Nike', imageUri: 'file://test3.jpg', createdAt: new Date().toISOString() },
      ];

      (StorageService.getClosetItems as jest.Mock).mockResolvedValue(items);

      const results = await ClosetService.searchItems('blue');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('should search by brand', async () => {
      const items: ClosetItem[] = [
        { id: '1', garmentType: GarmentType.SHIRT, color: 'blue', imageUri: 'file://test1.jpg', createdAt: new Date().toISOString() },
        { id: '2', garmentType: GarmentType.PANTS, color: 'black', brand: 'Nike', imageUri: 'file://test2.jpg', createdAt: new Date().toISOString() },
      ];

      (StorageService.getClosetItems as jest.Mock).mockResolvedValue(items);

      const results = await ClosetService.searchItems('nike');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });
  });
});

