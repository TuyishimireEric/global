import axios from "axios";
import { PartFormData } from "./useCreatePart";
import { 
  Part, 
  PartsResponse, 
  ApiResponse, 
  PartsQueryParams, 
  TransformedPart 
} from '@/types/parts';

export const createPart = async (partData: PartFormData) => {
  const response = await axios.post("/api/parts", partData);
  return response.data.data;
};

export const fetchParts = async (
  params: PartsQueryParams = {}
): Promise<PartsResponse> => {
  const searchParams = new URLSearchParams();

  // Add parameters to search params
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.searchText) searchParams.append("searchText", params.searchText);
  if (params.category) searchParams.append("category", params.category);
  if (params.brand) searchParams.append("brand", params.brand);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());
  if (params.minPrice !== undefined)
    searchParams.append("minPrice", params.minPrice.toString());
  if (params.maxPrice !== undefined)
    searchParams.append("maxPrice", params.maxPrice.toString());

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