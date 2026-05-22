import { useCallback, useEffect, useState } from 'react';

import {
  getPackageServiceErrorMessage,
  getPackages,
  searchPackages,
} from '@/services/package.service';
import type { PackageListItem } from '@/types/package';

const SEARCH_DEBOUNCE_MS = 400;

export function usePackagesExplore(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());
  const [packages, setPackages] = useState<PackageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchPackages = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = searchTerm
        ? await searchPackages(searchTerm)
        : await getPackages();
      setPackages(result);
    } catch (err) {
      setPackages([]);
      setError(getPackageServiceErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages(debouncedQuery);
  }, [debouncedQuery, fetchPackages]);

  const refetch = useCallback(() => {
    fetchPackages(debouncedQuery);
  }, [debouncedQuery, fetchPackages]);

  return {
    query,
    setQuery,
    packages,
    isLoading,
    error,
    refetch,
    isSearching: debouncedQuery.length > 0,
  };
}
