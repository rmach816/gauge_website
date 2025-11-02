import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryService } from '../services/history';
import { CheckHistory, MatchCheckResult } from '../types';
import { RootStackParamList } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';
import { formatDate } from '../utils/formatting';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [history, setHistory] = useState<CheckHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const checkHistory = await HistoryService.getHistory();
    setHistory(checkHistory);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all check history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await HistoryService.clearHistory();
              loadHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history.');
            }
          },
        },
      ]
    );
  };

  const handlePressItem = (check: CheckHistory) => {
    if (check.type === 'instant-check') {
      const result = check.result as MatchCheckResult;
      navigation.navigate('Result', { checkId: result.id });
    }
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'great':
        return '✅';
      case 'okay':
        return '⚠️';
      case 'poor':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No check history</Text>
            <Text style={styles.emptySubtext}>
              Your style checks will appear here
            </Text>
          </View>
        ) : (
          history.map((check) => {
            if (check.type === 'instant-check') {
              const result = check.result as MatchCheckResult;
              return (
                <TouchableOpacity
                  key={check.id}
                  style={styles.item}
                  onPress={() => handlePressItem(check)}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.rating}>
                      {getRatingEmoji(result.rating)} {result.rating.toUpperCase()}
                    </Text>
                    <Text style={styles.date}>{formatDate(check.createdAt)}</Text>
                  </View>
                  <Text style={styles.analysis} numberOfLines={2}>
                    {result.analysis}
                  </Text>
                  {result.suggestions.length > 0 && (
                    <Text style={styles.suggestions}>
                      {result.suggestions.length} suggestion(s)
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }
            return null;
          })
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  clearButton: {
    ...Typography.body,
    color: Colors.danger,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
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
  item: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  rating: {
    ...Typography.button,
    color: Colors.text,
    fontSize: 14,
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  analysis: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  suggestions: {
    ...Typography.caption,
    color: Colors.primary,
  },
});

