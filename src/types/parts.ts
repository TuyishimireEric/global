// types/parts.ts

export interface PartCreator {
  firstName: string;
  lastName: string;
}

export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description: string | null;
  brand: string | null;
  category: string;
  subcategory: string | null;
  price: string; // Backend returns as string for decimal precision
  discount: string; // Backend returns as string for decimal precision
  images: string[];
  isActive: boolean;
  createdAt: string;
  createdBy: PartCreator;
  updatedAt: string;
  // Optional fields that might come from backend later
  compatibleModels?: string[];
  specifications?: Record<string, any>;
  costPrice?: string | null;
  weight?: string | null;
  dimensions?: Record<string, any> | null;
  minimumStock?: number;
  stockQty?: number;
  availability?: "in-stock" | "low-stock" | "on-order" | "out-stock";
  rating?: number;
  featured?: boolean;
  manufacturer?: string; // Alias for brand for frontend compatibility
  sku?: string; // Alias for partNumber for frontend compatibility
}

export interface PartsResponse {
  parts: Part[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: "Success" | "Error";
  message: string;
  data: T;
}

export interface PartsFilters {
  category?: string;
  brand?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface PartsQueryParams {
  page?: number;
  limit?: number;
  searchText?: string;
  category?: string;
  brand?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// Frontend-specific types for filtering
export interface FrontendFilters {
  category: string[];
  manufacturer: string[];
  availability: string[];
  priceRange: [number, number];
  rating: number;
  featured: boolean;
  inStock: boolean;
}

// Transform function type
export interface TransformedPart extends Part {
  // Add computed properties for frontend compatibility
  manufacturer: string;
  sku: string;
  priceNumber: number;
  discountNumber: number;
  availability: "in-stock" | "low-stock" | "on-order" | "out-stock";
  // Guaranteed fields after transformation
  rating: number;
  stockQty: number;
  featured: boolean;
  compatibleModels: string[];
  specifications: Record<string, any>;
}

// types/admin.ts

export interface AdminFilters {
  searchText: string;
  category: string;
  brand: string;
  isActive: string; // 'all' | 'true' | 'false'
  availability: string;
  priceRange: {
    min: number;
    max: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
  createdBy: string;
}

export interface AdminTableColumn {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
  type?:
    | "text"
    | "number"
    | "date"
    | "boolean"
    | "currency"
    | "image"
    | "status";
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface ExportOptions {
  format: "xlsx" | "csv";
  includeImages: boolean;
  selectedColumns: string[];
  filename?: string;
}

export interface AdminPartView extends TransformedPart {
  createdAtFormatted: string;
  updatedAtFormatted: string;
  priceFormatted: string;
  discountFormatted: string;
  stockStatus: "critical" | "low" | "normal" | "high";
  isActiveText: string;
}

// Admin action types
export type AdminAction =
  | "view"
  | "edit"
  | "delete"
  | "duplicate"
  | "activate"
  | "deactivate";

export interface BulkAction {
  type: "activate" | "deactivate" | "delete" | "export";
  partIds: string[];
}
