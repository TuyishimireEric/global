// hooks/useCreatePart.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import showToast from "@/utils/showToast";
import { createPart } from "./services";

export interface PartFormData {
  partNumber: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  compatibleModels: string[];
  specifications: Record<string, any>;
  images: string[];
  price: string;
  discount: string;
  costPrice: string;
  weight: string;
  dimensions: string;
  minimumStock: number;
  isActive: boolean;
}

export const useCreatePart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPart,
    onSuccess: (data) => {
      showToast("Part created successfully!", "success");
      // Invalidate and refetch parts list
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to create part", "error");
    },
  });
};
