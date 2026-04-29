import { useQuery } from '@tanstack/react-query';
import * as productsApi from '@/api/products.api';
import type { DistinctFilters } from '@/types/product.types';

/* ── Hardcoded fallbacks (used when no products exist yet or API fails) ── */
const FALLBACK_SUBJECTS = ['Maths', 'English', 'Science', 'General Knowledge'];
const FALLBACK_FORMATS = ['physical', 'printable'];
const FALLBACK_AGE_RANGES = [
  { min_age: 0, max_age: 1 },
  { min_age: 1, max_age: 2 },
  { min_age: 2, max_age: 3 },
  { min_age: 3, max_age: 4 },
  { min_age: 4, max_age: 5 },
  { min_age: 5, max_age: 6 },
  { min_age: 6, max_age: 7 },
  { min_age: 7, max_age: 8 },
  { min_age: 8, max_age: 12 },
];



export interface UseProductFiltersReturn {
  subjects: string[];
  formats: string[];
  ageRanges: { min_age: number; max_age: number }[];
  isLoading: boolean;
}

export function useProductFilters(): UseProductFiltersReturn {
  const { data, isLoading } = useQuery<DistinctFilters>({
    queryKey: ['product-filters'],
    queryFn: productsApi.getFilters,
    staleTime: 5 * 60 * 1000, // 5 minutes - filter options don't change often
    retry: 1,
  });

  // Merge dynamic data with fallbacks so dropdowns always have options
  // Use dynamic data if available. Only use fallbacks if the API hasn't loaded data yet or fails.
  const subjects = data && data.subjects.length > 0
    ? data.subjects
    : (data ? [] : FALLBACK_SUBJECTS);

  const formats = data && data.formats.length > 0
    ? data.formats
    : (data ? [] : FALLBACK_FORMATS);

  const ageRanges = data && data.age_ranges.length > 0
    ? data.age_ranges
    : (data ? [] : FALLBACK_AGE_RANGES);

  return { subjects, formats, ageRanges, isLoading };
}
