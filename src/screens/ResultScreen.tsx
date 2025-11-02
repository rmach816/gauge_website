import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { MatchResult } from '../components/MatchResult';
import { SuggestionCard } from '../components/SuggestionCard';
import { ShoppingCard } from '../components/ShoppingCard';
import { HistoryService } from '../services/history';
import { AffiliateLinkService } from '../services/affiliateLinks';
import { RootStackParamList, MatchCheckResult, PriceRange, ShoppingItem } from '../types';
import { Colors, Spacing, Typography } from '../utils/constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Result'>;

export const ResultScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const [checkResult, setCheckResult] = useState<MatchCheckResult | null>(null);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    loadResult();
  }, [route.params.checkId]);

  const loadResult = async () => {
    const check = await HistoryService.getCheckById(route.params.checkId);
    if (!check) {
      return;
    }
    
    if (check.type === 'instant-check') {
      const result = check.result as MatchCheckResult;
      setCheckResult(result);
      
      // Generate shopping links for suggestions
      const items = await Promise.all(
        result.suggestions.map(async (suggestion) => {
          const options = AffiliateLinkService.generateShoppingOptions({
            garmentType: suggestion.garmentType,
            description: suggestion.description,
            colors: suggestion.colors,
            priceRange: PriceRange.MID,
          });
          return options;
        })
      );
      setShoppingItems(items.flat());
    }
  };

  if (!checkResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Style Analysis</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <MatchResult rating={checkResult.rating} analysis={checkResult.analysis} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          {checkResult.suggestions.map((suggestion, index) => (
            <SuggestionCard key={suggestion.id || index} suggestion={suggestion} />
          ))}
        </View>

        {shoppingItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Recommendations</Text>
            {shoppingItems.slice(0, 6).map((item, index) => (
              <ShoppingCard key={item.id || index} item={item} />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  closeButton: {
    ...Typography.h2,
    color: Colors.textSecondary,
    fontSize: 24,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
});

