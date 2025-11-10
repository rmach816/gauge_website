import { useState, useMemo, useCallback } from 'react';

/**
 * Generic search hook
 * Provides search functionality for any array of items
 */
export const useSearch = <T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean
) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter((item) => searchFn(item, query));
  }, [items, searchQuery, searchFn]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    clearSearch,
  };
};

