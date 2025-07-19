// hooks/useAdminParts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Part,
  PartsResponse,
  ApiResponse,
  TransformedPart,
} from "@/types/parts";
import { AdminFilters, AdminPartView, SortConfig } from "@/types/parts";
import { transformPart } from "./useClientParts";

// Extended fetch function for admin with more parameters
const fetchAdminParts = async (params: {
  page?: number;
  limit?: number;
  filters?: Partial<AdminFilters>;
  sort?: SortConfig;
}): Promise<PartsResponse> => {
  const { page = 1, limit = 50, filters = {}, sort } = params;
  const searchParams = new URLSearchParams();

  // Basic pagination
  searchParams.append("page", page.toString());
  searchParams.append("limit", limit.toString());

  // Filter parameters
  if (filters.searchText) searchParams.append("searchText", filters.searchText);
  if (filters.category && filters.category !== "all")
    searchParams.append("category", filters.category);
  if (filters.brand && filters.brand !== "all")
    searchParams.append("brand", filters.brand);
  if (filters.isActive && filters.isActive !== "all")
    searchParams.append("isActive", filters.isActive);
  if (filters.priceRange?.min)
    searchParams.append("minPrice", filters.priceRange.min.toString());
  if (filters.priceRange?.max)
    searchParams.append("maxPrice", filters.priceRange.max.toString());

  // Sort parameters
  if (sort) {
    searchParams.append("sortBy", sort.key);
    searchParams.append("sortOrder", sort.direction);
  }

  const response = await fetch(`/api/parts?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<PartsResponse> = await response.json();

  if (result.status === "Error") {
    throw new Error(result.message);
  }

  return result.data;
};

// Transform part for admin view with additional computed fields
const transformAdminPart = (part: Part): AdminPartView => {
  const transformedPart = transformPart(part); // Use existing transform function

  const stockStatus: "critical" | "low" | "normal" | "high" =
    transformedPart.stockQty < 5
      ? "critical"
      : transformedPart.stockQty < 20
      ? "low"
      : transformedPart.stockQty < 50
      ? "normal"
      : "high";

  return {
    ...transformedPart,
    createdAtFormatted: new Date(part.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    updatedAtFormatted: part.updatedAt
      ? new Date(part.updatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A",
    priceFormatted: `$${parseFloat(part.price).toFixed(2)}`,
    discountFormatted: `${parseFloat(part.discount)}%`,
    stockStatus,
    isActiveText: part.isActive ? "Active" : "Inactive",
  };
};

interface UseAdminPartsOptions {
  page?: number;
  limit?: number;
  filters?: Partial<AdminFilters>;
  sort?: SortConfig;
  enabled?: boolean;
}

export const useAdminParts = (options: UseAdminPartsOptions = {}) => {
  const { page = 1, limit = 50, filters = {}, sort, enabled = true } = options;

  const queryKey = ["admin-parts", page, limit, filters, sort];

  const { data, isLoading, isError, error, isSuccess, isFetching, refetch } =
    useQuery({
      queryKey,
      queryFn: () => fetchAdminParts({ page, limit, filters, sort }),
      enabled,
      staleTime: 2 * 60 * 1000, // 2 minutes for admin (more frequent updates)
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    });

  return {
    parts: data?.parts.map(transformAdminPart) || [],
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

// Mutation for updating part status
export const useUpdatePartStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      partId,
      isActive,
    }: {
      partId: string;
      isActive: boolean;
    }) => {
      const response = await fetch(`/api/parts/${partId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update part status");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch parts data
      queryClient.invalidateQueries({ queryKey: ["admin-parts"] });
    },
  });
};

// Mutation for bulk actions
export const useBulkPartActions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      partIds,
    }: {
      action: string;
      partIds: string[];
    }) => {
      const response = await fetch("/api/parts/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, partIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform bulk action");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-parts"] });
    },
  });
};

export default useAdminParts;
