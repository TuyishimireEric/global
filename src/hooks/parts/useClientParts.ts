// hooks/useClientParts.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
  Part, 
  PartsResponse, 
  ApiResponse, 
  PartsQueryParams, 
  TransformedPart 
} from '@/types/parts';

// API function to fetch parts
const fetchParts = async (params: PartsQueryParams = {}): Promise<PartsResponse> => {
  const searchParams = new URLSearchParams();
  
  // Add parameters to search params
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.searchText) searchParams.append('searchText', params.searchText);
  if (params.category) searchParams.append('category', params.category);
  if (params.brand) searchParams.append('brand', params.brand);
  if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
  if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());

  const response = await fetch(`/api/parts?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<PartsResponse> = await response.json();
  
  if (result.status === 'Error') {
    throw new Error(result.message);
  }

  return result.data;
};

// Transform backend part to frontend part with compatibility fields
export const transformPart = (part: Part): TransformedPart => {
  // Generate static rating based on part characteristics (consistent but varied)
  const generateRating = (partNumber: string, category: string): number => {
    const hash = partNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const categoryBonus = category === 'Filtration' ? 0.3 : 
                         category === 'Engine' ? 0.2 : 
                         category === 'Hydraulic' ? 0.1 : 0;
    const baseRating = 3.5 + (hash % 100) / 100 + categoryBonus;
    return Math.min(5, Math.max(3, Math.round(baseRating * 10) / 10));
  };

  // Generate stock quantity based on part characteristics
  const generateStockQty = (partNumber: string, category: string): number => {
    const hash = partNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseStock = category === 'Filtration' ? 50 : 
                     category === 'Engine' ? 25 : 
                     category === 'Hydraulic' ? 35 : 40;
    return baseStock + (hash % 30);
  };

  // Determine availability based on stock
  const stockQty = part.stockQty ?? generateStockQty(part.partNumber, part.category);
  const availability: 'in-stock' | 'low-stock' | 'on-order' | 'out-stock' = 
    stockQty > 20 ? 'in-stock' : 
    stockQty > 5 ? 'low-stock' : 
    stockQty > 0 ? 'low-stock' : 'out-stock';

  return {
    ...part,
    // Add computed/compatibility fields
    manufacturer: part.brand || 'Unknown',
    sku: part.partNumber,
    priceNumber: parseFloat(part.price) || 0,
    discountNumber: parseFloat(part.discount) || 0,
    availability,
    // Guaranteed fields with static data
    stockQty,
    rating: part.rating ?? generateRating(part.partNumber, part.category),
    featured: part.featured ?? (parseFloat(part.discount) > 5), // Featured if discount > 5%
    compatibleModels: part.compatibleModels || [],
    specifications: part.specifications || {},
  };
};

interface UseClientPartsOptions {
  page?: number;
  limit?: number;
  searchText?: string;
  category?: string;
  brand?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  enabled?: boolean; // Allow disabling the query
}

interface UseClientPartsReturn {
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

export const useClientParts = (
  options: UseClientPartsOptions = {}
): UseClientPartsReturn => {
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

export default useClientParts;