import { StorageService } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, ClosetItem, GarmentType } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserProfile', () => {
    it('should save and retrieve user profile', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        measurements: {
          height: 72,
          weight: 180,
          chest: 40,
          waist: 34,
          inseam: 32,
          neck: 16,
          sleeve: 33,
          preferredFit: 'regular',
        },
        stylePreference: 'modern',
        shoeSize: '10',
      };

      await StorageService.saveUserProfile(profile);
      const retrieved = await StorageService.getUserProfile();

      expect(retrieved).toEqual(profile);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return null if profile does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const profile = await StorageService.getUserProfile();
      expect(profile).toBeNull();
    });
  });

  describe('ClosetItems', () => {
    it('should save and retrieve closet items', async () => {
      const items: ClosetItem[] = [
        {
          id: '1',
          garmentType: GarmentType.SHIRT,
          color: 'blue',
          imageUri: 'file://test.jpg',
          createdAt: new Date().toISOString(),
        },
      ];

      await StorageService.saveClosetItems(items);
      const retrieved = await StorageService.getClosetItems();

      expect(retrieved).toEqual(items);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return empty array if no items exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const items = await StorageService.getClosetItems();
      expect(items).toEqual([]);
    });
  });

  describe('OnboardingState', () => {
    it('should save and retrieve onboarding state', async () => {
      const state = {
        completed: true,
        completedAt: new Date().toISOString(),
      };

      await StorageService.saveOnboardingState(state);
      const retrieved = await StorageService.getOnboardingState();

      expect(retrieved).toEqual(state);
    });
  });
});

