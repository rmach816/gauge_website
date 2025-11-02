import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ClosetItemComponent } from '../components/ClosetItem';
import { ClosetService } from '../services/closet';
import { ClosetItem, GarmentType } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';
import uuid from 'react-native-uuid';

export const ClosetScreen: React.FC = () => {
  const [items, setItems] = useState<ClosetItem[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const closetItems = await ClosetService.getClosetItems();
    setItems(closetItems);
  };

  const handleAddItem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newItem: ClosetItem = {
        id: uuid.v4() as string,
        imageUri: result.assets[0].uri,
        garmentType: GarmentType.SHIRT, // Default, user can edit
        color: 'Unknown',
        addedAt: new Date().toISOString(),
      };

      try {
        await ClosetService.addItem(newItem);
        loadItems();
      } catch (error) {
        Alert.alert('Error', 'Failed to add item to closet.');
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this from your closet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ClosetService.removeItem(itemId);
              loadItems();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Closet</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Your closet is empty</Text>
            <Text style={styles.emptySubtext}>
              Add items to get personalized matching suggestions
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map((item) => (
              <ClosetItemComponent
                key={item.id}
                item={item}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  addButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

