import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryService } from '../services/history';
import { CheckHistory, MatchCheckResult, CompleteOutfit, ChatSession } from '../types';
import { RootStackParamList } from '../types';
import { WoodBackground } from '../components/WoodBackground';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { Icon, AppIcons } from '../components/Icon';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import { formatDate } from '../utils/formatting';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type HistoryItem = CheckHistory & {
  displayDate: string; // "Today", "Yesterday", "This Week", or formatted date
  groupKey: string; // For grouping by date
};

type FilterType = 'all' | 'instant-check' | 'outfit-builder' | 'chat-session';

/**
 * HistoryScreen
 * Comprehensive history view with filtering, search, and rich previews
 */
export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [history, setHistory] = useState<CheckHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const loadHistory = useCallback(async () => {
    const checkHistory = await HistoryService.getHistory();
    setHistory(checkHistory);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  // Group history by date and format display dates
  const groupedHistory = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const items: HistoryItem[] = history
      .filter((check) => {
        // Apply type filter
        if (filterType !== 'all' && check.type !== filterType) {
          return false;
        }

        // Apply search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          if (check.type === 'instant-check') {
            const result = check.result as MatchCheckResult;
            return (
              result.analysis.toLowerCase().includes(query) ||
              result.rating.toLowerCase().includes(query)
            );
          } else if (check.type === 'outfit-builder') {
            const result = check.result as CompleteOutfit;
            return (
              result.occasion.toLowerCase().includes(query) ||
              result.items.some((item) =>
                item.description.toLowerCase().includes(query)
              )
            );
          } else if (check.type === 'chat-session') {
            const result = check.result as ChatSession;
            return result.messages.some((msg) =>
              msg.content.some((c) =>
                c.text?.toLowerCase().includes(query)
              )
            );
          }
        }

        return true;
      })
      .map((check) => {
        const checkDate = new Date(check.createdAt);
        let displayDate = formatDate(check.createdAt);
        let groupKey = 'older';

        if (checkDate >= today) {
          displayDate = 'Today';
          groupKey = 'today';
        } else if (checkDate >= yesterday) {
          displayDate = 'Yesterday';
          groupKey = 'yesterday';
        } else if (checkDate >= thisWeek) {
          displayDate = 'This Week';
          groupKey = 'this-week';
        } else {
          // Group by month/year for older items
          groupKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}`;
        }

        return {
          ...check,
          displayDate,
          groupKey,
        };
      })
      .sort((a, b) => {
        // Sort by date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    // Group by groupKey
    const grouped: Record<string, HistoryItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.groupKey]) {
        grouped[item.groupKey] = [];
      }
      grouped[item.groupKey].push(item);
    });

    return grouped;
  }, [history, searchQuery, filterType]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all check history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await HistoryService.clearHistory();
              loadHistory();
              Alert.alert('Success', 'History cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history.');
            }
          },
        },
      ]
    );
  }, [loadHistory]);

  const handlePressItem = useCallback((check: CheckHistory) => {
    if (check.type === 'instant-check' || check.type === 'outfit-builder') {
      navigation.navigate('Result', { checkId: check.id });
    } else if (check.type === 'chat-session') {
      // Navigate to chat with session ID (would need to implement chat session loading)
      navigation.navigate('Chat');
    }
  }, [navigation]);

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'great':
        return { name: AppIcons.check.name, library: AppIcons.check.library };
      case 'okay':
        return { name: AppIcons.warning.name, library: AppIcons.warning.library };
      case 'poor':
        return { name: AppIcons.error.name, library: AppIcons.error.library };
      default:
        return { name: AppIcons.info.name, library: AppIcons.info.library };
    }
  };

  const getTypeIcon = (type: CheckHistory['type']) => {
    switch (type) {
      case 'instant-check':
        return { name: AppIcons.camera.name, library: AppIcons.camera.library };
      case 'outfit-builder':
        return { name: AppIcons.target.name, library: AppIcons.target.library };
      case 'chat-session':
        return { name: AppIcons.chat.name, library: AppIcons.chat.library };
      default:
        return { name: AppIcons.history.name, library: AppIcons.history.library };
    }
  };

  const getTypeLabel = (type: CheckHistory['type']) => {
    switch (type) {
      case 'instant-check':
        return 'Style Check';
      case 'outfit-builder':
        return 'Outfit';
      case 'chat-session':
        return 'Chat';
      default:
        return 'Check';
    }
  };

  const renderHistoryItem = (item: HistoryItem) => {
    if (item.type === 'instant-check') {
      const result = item.result as MatchCheckResult;
      return (
        <TouchableOpacity
          style={styles.item}
          onPress={() => handlePressItem(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderLeft}>
              {(() => {
                const typeIcon = getTypeIcon(item.type);
                return <Icon name={typeIcon.name} size={24} color={TailorColors.gold} library={typeIcon.library} style={styles.typeIcon} />;
              })()}
              <View style={styles.itemHeaderText}>
                <Text style={styles.typeLabel}>{getTypeLabel(item.type)}</Text>
                <Text style={styles.date}>{item.displayDate}</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              {(() => {
                const ratingIcon = getRatingIcon(result.rating);
                return <Icon name={ratingIcon.name} size={16} color={TailorColors.gold} library={ratingIcon.library} />;
              })()}
              <Text style={styles.rating}>
                {result.rating.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.analysis} numberOfLines={2}>
            {result.analysis}
          </Text>
          {result.suggestions.length > 0 && (
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {result.suggestions.length} suggestion{result.suggestions.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    } else if (item.type === 'outfit-builder') {
      const result = item.result as CompleteOutfit;
      const firstItem = result.items[0];
      const hasWardrobeItems = result.items.some((it) => it.existingItem);
      const missingItems = result.items.filter((it) => !it.existingItem);

      return (
        <TouchableOpacity
          style={styles.item}
          onPress={() => handlePressItem(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderLeft}>
              {(() => {
                const typeIcon = getTypeIcon(item.type);
                return <Icon name={typeIcon.name} size={24} color={TailorColors.gold} library={typeIcon.library} style={styles.typeIcon} />;
              })()}
              <View style={styles.itemHeaderText}>
                <Text style={styles.typeLabel}>{getTypeLabel(item.type)}</Text>
                <Text style={styles.date}>{item.displayDate}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.outfitOccasion}>{result.occasion}</Text>
          <View style={styles.outfitPreview}>
            {firstItem?.existingItem?.imageUri && (
              <Image
                source={{ uri: firstItem.existingItem.imageUri }}
                style={styles.outfitThumbnail}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            )}
            <View style={styles.outfitDetails}>
              <Text style={styles.outfitItems}>
                {result.items.length} item{result.items.length !== 1 ? 's' : ''}
              </Text>
              {hasWardrobeItems && (
                <Text style={styles.outfitMeta}>
                  ✓ Includes wardrobe items
                </Text>
              )}
              {missingItems.length > 0 && (
                <Text style={styles.outfitMeta}>
                  {missingItems.length} item{missingItems.length !== 1 ? 's' : ''} to shop
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    } else if (item.type === 'chat-session') {
      const result = item.result as ChatSession;
      const lastMessage = result.messages[result.messages.length - 1];
      const lastMessageText = lastMessage?.content.find((c) => c.type === 'text')?.text || '';

      return (
        <TouchableOpacity
          style={styles.item}
          onPress={() => handlePressItem(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderLeft}>
              {(() => {
                const typeIcon = getTypeIcon(item.type);
                return <Icon name={typeIcon.name} size={24} color={TailorColors.gold} library={typeIcon.library} style={styles.typeIcon} />;
              })()}
              <View style={styles.itemHeaderText}>
                <Text style={styles.typeLabel}>{getTypeLabel(item.type)}</Text>
                <Text style={styles.date}>{item.displayDate}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.chatPreview} numberOfLines={2}>
            {lastMessageText || 'Chat session'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {result.messages.length} message{result.messages.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderGroup = (groupKey: string, items: HistoryItem[]) => {
    const groupTitle = items[0].displayDate;
    return (
      <View key={groupKey} style={styles.group}>
        <Text style={styles.groupTitle}>{groupTitle}</Text>
        {items.map((item, index) => (
          <React.Fragment key={`${item.id}-${index}`}>
            {renderHistoryItem(item)}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const groupKeys = Object.keys(groupedHistory).sort((a, b) => {
    // Sort groups: today, yesterday, this-week, then by date
    const order: Record<string, number> = {
      today: 0,
      yesterday: 1,
      'this-week': 2,
    };
    const aOrder = order[a] ?? 3;
    const bOrder = order[b] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return b.localeCompare(a); // Descending for dates
  });

  const totalItems = Object.values(groupedHistory).reduce((sum, items) => sum + items.length, 0);

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.headerSection}>
          {/* Search and Filter */}
          <View style={styles.topSection}>
            <View style={styles.searchBarContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search history..."
                onClear={() => setSearchQuery('')}
                style={styles.searchBarStyle}
              />
            </View>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleClearHistory} style={styles.clearButtonContainer}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {(['all', 'instant-check', 'outfit-builder', 'chat-session'] as FilterType[]).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    filterType === type && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <View style={styles.filterButtonContent}>
                    {type !== 'all' && (() => {
                      const typeIcon = getTypeIcon(type as CheckHistory['type']);
                      return (
                        <Icon 
                          name={typeIcon.name} 
                          size={14} 
                          color={filterType === type ? TailorContrasts.onGold : TailorContrasts.onWoodMedium} 
                          library={typeIcon.library} 
                          style={styles.filterButtonIcon}
                        />
                      );
                    })()}
                    <Text
                      style={[
                        styles.filterButtonText,
                        filterType === type && styles.filterButtonTextActive,
                      ]}
                    >
                      {type === 'all'
                        ? 'All'
                        : type === 'instant-check'
                        ? 'Checks'
                        : type === 'outfit-builder'
                        ? 'Outfits'
                        : 'Chats'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          {/* Results Count */}
          {totalItems > 0 && (
            <View style={styles.resultsCount}>
              <Text style={styles.resultsCountText}>
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </Text>
            </View>
          )}
        </View>

        {/* History List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {totalItems === 0 ? (
            <EmptyState
              type={searchQuery || filterType !== 'all' ? 'history-search' : 'history'}
              onAction={!searchQuery && filterType === 'all' ? () => navigation.navigate('QuickStyleCheck') : undefined}
            />
          ) : (
            groupKeys.map((key) => renderGroup(key, groupedHistory[key]))
          )}
        </ScrollView>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    // Wraps search, filters, and results count - takes only the space it needs
  },
  topSection: {
    paddingHorizontal: TailorSpacing.xl,
    paddingTop: TailorSpacing.md,
    paddingBottom: TailorSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TailorSpacing.sm,
  },
  searchBarContainer: {
    flex: 1,
  },
  searchBarStyle: {
    paddingHorizontal: 0, // Remove SearchBar's own padding since we're in a container
    paddingVertical: TailorSpacing.xs, // Keep minimal vertical padding for touch target
  },
  clearButtonContainer: {
    paddingVertical: TailorSpacing.sm,
    paddingHorizontal: TailorSpacing.xs,
    justifyContent: 'center',
  },
  clearButtonText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: TailorSpacing.xl,
    paddingBottom: TailorSpacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    marginBottom: TailorSpacing.sm,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: TailorSpacing.sm,
  },
  searchInput: {
    flex: 1,
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    padding: 0,
  },
  clearSearch: {
    ...TailorTypography.h3,
    color: TailorColors.ivory,
    fontSize: 18,
    padding: TailorSpacing.xs,
  },
  filterContainer: {
    marginTop: TailorSpacing.xs,
  },
  filterContent: {
    paddingLeft: TailorSpacing.xl,
    paddingRight: TailorSpacing.xl,
  },
  filterButton: {
    paddingHorizontal: TailorSpacing.sm,
    paddingVertical: 6, // Fixed small vertical padding
    borderRadius: TailorBorderRadius.sm,
    backgroundColor: TailorColors.woodMedium,
    marginRight: TailorSpacing.sm,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
    minWidth: 60,
    height: 32, // Fixed height to prevent them from being too tall
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TailorSpacing.xs,
  },
  filterButtonIcon: {
    marginRight: 0,
  },
  filterButtonActive: {
    backgroundColor: TailorColors.gold,
    borderColor: TailorColors.gold,
  },
  filterButtonText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
    fontSize: 12, // Smaller font size
  },
  filterButtonTextActive: {
    color: TailorContrasts.onGold,
  },
  resultsCount: {
    paddingHorizontal: TailorSpacing.xl,
    paddingBottom: TailorSpacing.sm,
  },
  resultsCountText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: TailorSpacing.xl,
    paddingTop: TailorSpacing.md,
  },
  group: {
    marginBottom: TailorSpacing.xl,
  },
  groupTitle: {
    ...TailorTypography.h3,
    color: TailorColors.gold,
    marginBottom: TailorSpacing.md,
    fontWeight: '700',
  },
  item: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginBottom: TailorSpacing.sm,
    ...TailorShadows.small,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TailorSpacing.xs,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: TailorSpacing.sm,
  },
  itemHeaderText: {
    flex: 1,
  },
  typeLabel: {
    ...TailorTypography.label,
    color: TailorColors.gold,
    fontWeight: '600',
  },
  date: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TailorSpacing.xs,
  },
  rating: {
    ...TailorTypography.caption,
    color: TailorColors.gold,
    fontWeight: '700',
  },
  analysis: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  outfitOccasion: {
    ...TailorTypography.h3,
    color: TailorColors.gold,
    marginBottom: TailorSpacing.sm,
  },
  outfitPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outfitThumbnail: {
    width: 80,
    height: 80,
    borderRadius: TailorBorderRadius.sm,
    backgroundColor: TailorColors.woodLight,
    marginRight: TailorSpacing.sm,
  },
  outfitDetails: {
    flex: 1,
  },
  outfitItems: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs / 2,
  },
  outfitMeta: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginTop: 2,
  },
  chatPreview: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
    fontStyle: 'italic',
  },
  metaRow: {
    marginTop: TailorSpacing.xs,
  },
  metaText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TailorSpacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: TailorSpacing.md,
  },
  emptyText: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.sm,
  },
  emptySubtext: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
    paddingHorizontal: TailorSpacing.xl,
  },
});
