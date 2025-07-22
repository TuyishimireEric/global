// hooks/usePartItemsMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PartItem } from "@/types";
import showToast from "@/utils/showToast";

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface BulkCreateData {
  partId: string;
  items: Omit<PartItem, "id">[];
}

// API functions
const partItemsApi = {
  create: async (data: Omit<PartItem, "id">): Promise<PartItem> => {
    const response = await fetch("/api/parts/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<PartItem> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to create part item");
    }

    return result.data;
  },

  update: async (data: PartItem): Promise<PartItem> => {
    const response = await fetch("/api/parts/items", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<PartItem> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to update part item");
    }

    return result.data;
  },

  bulkCreate: async (data: BulkCreateData): Promise<PartItem[]> => {
    const response = await fetch("/api/parts/items?bulk=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<PartItem[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to bulk create part items");
    }

    return result.data;
  },

  checkBarcode: async (
    barcode: string
  ): Promise<{ exists: boolean; data: PartItem | null }> => {
    const response = await fetch(
      `/api/parts/items?checkBarcode=${encodeURIComponent(barcode)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to check barcode");
    }

    return { exists: result.exists, data: result.data };
  },
};

// Custom hooks for mutations
export const useCreatePartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partItemsApi.create,
    onSuccess: () => {
      showToast("Part Item Added successfully!", "success");
      // Invalidate and refetch part items queries
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error) => {
      console.error("Error creating part item:", error);
    },
  });
};

export const useUpdatePartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partItemsApi.update,
    onSuccess: (updatedItem) => {
      // Invalidate and refetch part items queries
      queryClient.invalidateQueries({ queryKey: ["partItems"] });

      // Update the specific item in cache
      queryClient.setQueryData(["partItems", updatedItem.id], updatedItem);

      // Update the item in the list cache
      queryClient.setQueryData(["partItems"], (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((item: PartItem) =>
          item.id === updatedItem.id ? updatedItem : item
        );
      });
    },
    onError: (error) => {
      console.error("Error updating part item:", error);
    },
  });
};

export const useBulkCreatePartItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partItemsApi.bulkCreate,
    onSuccess: (newItems) => {
      // Invalidate part items queries
      queryClient.invalidateQueries({ queryKey: ["partItems"] });

      // Optionally update cache with new items
      queryClient.setQueryData(["partItems"], (oldData: any) => {
        if (!oldData) return newItems;
        return [...oldData, ...newItems];
      });
    },
    onError: (error) => {
      console.error("Error bulk creating part items:", error);
    },
  });
};

export const useCheckBarcode = () => {
  return useMutation({
    mutationFn: partItemsApi.checkBarcode,
    onError: (error) => {
      console.error("Error checking barcode:", error);
    },
  });
};

// Combined hook for all part item mutations
export const usePartItemsMutations = () => {
  const createMutation = useCreatePartItem();
  const updateMutation = useUpdatePartItem();
  const bulkCreateMutation = useBulkCreatePartItems();
  const checkBarcodeMutation = useCheckBarcode();

  return {
    create: createMutation,
    update: updateMutation,
    bulkCreate: bulkCreateMutation,
    checkBarcode: checkBarcodeMutation,

    // Convenience properties
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      bulkCreateMutation.isPending,
    isError:
      createMutation.isError ||
      updateMutation.isError ||
      bulkCreateMutation.isError,
  };
};
