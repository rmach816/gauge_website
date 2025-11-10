import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TailorColors } from '../utils/constants';

export type IconLibrary = 'feather' | 'ionicons' | 'material';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  library?: IconLibrary;
  style?: StyleProp<TextStyle>;
}

/**
 * Icon Component
 * Unified icon component using @expo/vector-icons
 * Provides consistent icon styling across the app
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = TailorColors.cream,
  library = 'feather',
  style,
}) => {
  const iconProps = {
    name: name as any,
    size,
    color,
    style,
  };

  switch (library) {
    case 'ionicons':
      return <Ionicons {...iconProps} />;
    case 'material':
      return <MaterialCommunityIcons {...iconProps} />;
    case 'feather':
    default:
      return <Feather {...iconProps} />;
  }
};

/**
 * Predefined icon mappings for common use cases
 * These match the premium tailor aesthetic
 */
export const AppIcons = {
  // Navigation
  home: { name: 'home', library: 'feather' as IconLibrary },
  history: { name: 'clock', library: 'feather' as IconLibrary },
  closet: { name: 'package', library: 'feather' as IconLibrary },
  shop: { name: 'shopping-bag', library: 'feather' as IconLibrary },
  settings: { name: 'settings', library: 'feather' as IconLibrary },
  chat: { name: 'message-circle', library: 'feather' as IconLibrary },
  
  // Actions
  camera: { name: 'camera', library: 'feather' as IconLibrary },
  image: { name: 'image', library: 'feather' as IconLibrary },
  photo: { name: 'camera', library: 'feather' as IconLibrary },
  send: { name: 'send', library: 'feather' as IconLibrary },
  search: { name: 'search', library: 'feather' as IconLibrary },
  add: { name: 'plus', library: 'feather' as IconLibrary },
  edit: { name: 'edit', library: 'feather' as IconLibrary },
  delete: { name: 'trash-2', library: 'feather' as IconLibrary },
  save: { name: 'bookmark', library: 'feather' as IconLibrary },
  favorite: { name: 'star', library: 'feather' as IconLibrary },
  favoriteFilled: { name: 'star', library: 'feather' as IconLibrary },
  
  // Status
  check: { name: 'check-circle', library: 'feather' as IconLibrary },
  warning: { name: 'alert-circle', library: 'feather' as IconLibrary },
  error: { name: 'x-circle', library: 'feather' as IconLibrary },
  info: { name: 'info', library: 'feather' as IconLibrary },
  
  // Clothing
  shirt: { name: 'tshirt-crew', library: 'material' as IconLibrary },
  pants: { name: 'columns', library: 'feather' as IconLibrary },
  jacket: { name: 'box', library: 'feather' as IconLibrary },
  shoes: { name: 'shoe-formal', library: 'material' as IconLibrary },
  hat: { name: 'baseball-cap', library: 'material' as IconLibrary },
  accessories: { name: 'watch', library: 'material' as IconLibrary },
  suit: { name: 'tshirt-crew', library: 'material' as IconLibrary },
  wardrobe: { name: 'package', library: 'feather' as IconLibrary },
  tie: { name: 'tie', library: 'material' as IconLibrary },
  
  // Features
  target: { name: 'target', library: 'feather' as IconLibrary },
  sparkles: { name: 'zap', library: 'feather' as IconLibrary },
  premium: { name: 'award', library: 'feather' as IconLibrary },
  star: { name: 'star', library: 'feather' as IconLibrary },
  
  // Shopping
  shopping: { name: 'shopping-bag', library: 'feather' as IconLibrary },
  
  // User
  user: { name: 'user', library: 'feather' as IconLibrary },
  
  // Device
  phone: { name: 'smartphone', library: 'feather' as IconLibrary },
  
  // UI
  chevronRight: { name: 'chevron-right', library: 'feather' as IconLibrary },
  chevronLeft: { name: 'chevron-left', library: 'feather' as IconLibrary },
  close: { name: 'x', library: 'feather' as IconLibrary },
  menu: { name: 'menu', library: 'feather' as IconLibrary },
};

