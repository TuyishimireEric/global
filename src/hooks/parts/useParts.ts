// hooks/useParts.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
  Part, 
  PartsResponse, 
  ApiResponse, 
  PartsQueryParams, 
  TransformedPart 
} from '@/types/parts';
import { fetchParts, transformPart } from './services';

interface UsePartsOptions {
  page?: number;
  limit?: number;
  searchText?: string;
  category?: string;
  brand?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  enabled?: boolean;
}

interface UsePartsReturn {
  parts: TransformedPart[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  isFetching: boolean;
  refetch: () => void;
}

export const useParts = (
  options: UsePartsOptions = {}
): UsePartsReturn => {
  const {
    page = 1,
    limit = 20,
    searchText,
    category,
    brand,
    isActive,
    minPrice,
    maxPrice,
    enabled = true,
  } = options;

  const queryKey = [
    'parts',
    page,
    limit,
    searchText,
    category,
    brand,
    isActive,
    minPrice,
    maxPrice,
  ];

  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    isFetching,
    refetch,
  }: UseQueryResult<PartsResponse, Error> = useQuery({
    queryKey,
    queryFn: () => fetchParts({
      page,
      limit,
      searchText,
      category,
      brand,
      isActive,
      minPrice,
      maxPrice,
    }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    parts: data?.parts.map(transformPart) || [],
    totalCount: data?.totalCount || 0,
    currentPage: data?.currentPage || page,
    totalPages: data?.totalPages || 0,
    isLoading,
    isError,
    error,
    isSuccess,
    isFetching,
    refetch,
  };
};

// Additional hook for getting unique categories and brands for filters
export const usePartsMetadata = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['parts-metadata'],
    queryFn: () => fetchParts({ limit: 1000 }), // Fetch more to get all categories/brands
    select: (data) => {
      const categories = [...new Set(data.parts.map(part => part.category))];
      const brands = [...new Set(data.parts.map(part => part.brand).filter(Boolean))];
      
      return {
        categories: categories.sort(),
        brands: brands.sort(),
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - metadata doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    categories: data?.categories || [],
    brands: data?.brands || [],
    isLoading,
    isError,
  };
};

export default useParts;