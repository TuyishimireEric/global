"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  CheckSquare,
  Square,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings,
  Calendar,
  DollarSign,
  Package,
  Users,
  BarChart3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Copy,
  Power,
  PowerOff,
  Warehouse,
} from "lucide-react";
import {
  useAdminParts,
  useUpdatePartStatus,
  useBulkPartActions,
} from "@/hooks/parts/useAdminParts";
import { usePartsMetadata } from "@/hooks/parts/useClientParts";
import {
  AdminFilters,
  SortConfig,
  AdminPartView,
  AdminTableColumn,
} from "@/types/parts";
import {
  exportToExcel,
  exportFilteredData,
  getExportColumnOptions,
} from "@/utils/exportExcel";

const AdminPartsPage: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<AdminFilters>({
    searchText: "",
    category: "all",
    brand: "all",
    isActive: "all",
    availability: "all",
    priceRange: { min: 0, max: 10000 },
    dateRange: { start: "", end: "" },
    createdBy: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  });
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Data fetching
  const {
    parts,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useAdminParts({
    page: currentPage,
    limit: pageSize,
    filters,
    sort: sortConfig,
  });

  const {
    categories,
    brands,
    isLoading: isMetadataLoading,
  } = usePartsMetadata();

  // Mutations
  const updateStatusMutation = useUpdatePartStatus();
  const bulkActionMutation = useBulkPartActions();

  // Table columns configuration
  const columns: AdminTableColumn[] = [
    { key: "select", label: "", sortable: false, width: "50px" },
    { key: "partNumber", label: "Part Number", sortable: true, width: "140px" },
    { key: "name", label: "Part Name", sortable: true, width: "250px" },
    { key: "category", label: "Category", sortable: true, width: "130px" },
    { key: "brand", label: "Brand", sortable: true, width: "110px" },
    {
      key: "priceFormatted",
      label: "Price",
      sortable: true,
      width: "100px",
      type: "currency",
    },
    { key: "stockQty", label: "Stock", sortable: true, width: "80px" },
    {
      key: "isActiveText",
      label: "Status",
      sortable: true,
      width: "90px",
      type: "status",
    },
    { key: "actions", label: "Actions", sortable: false, width: "120px" },
  ];

  // Computed statistics
  const statistics = useMemo(() => {
    const totalStockValue = parts.reduce((sum, p) => {
      // Assuming cost price is available or calculate from price with some margin
      const costPrice = p.priceNumber * 0.7; // Assuming 30% margin
      return sum + (costPrice * p.stockQty);
    }, 0);

    return {
      total: totalCount,
      stockValue: totalStockValue,
      lowStock: parts.filter(
        (p) => p.stockQty < 10 // Assuming low stock threshold of 10
      ).length,
      categories: new Set(parts.map((p) => p.category)).size,
      avgPrice:
        parts.length > 0
          ? parts.reduce((sum, p) => sum + p.priceNumber, 0) / parts.length
          : 0,
      totalStockQty: parts.reduce((sum, p) => sum + p.stockQty, 0),
    };
  }, [parts, totalCount]);

  // Event handlers
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectAll = () => {
    if (selectedParts.length === parts.length) {
      setSelectedParts([]);
    } else {
      setSelectedParts(parts.map((p) => p.id));
    }
  };

  const handleSelectPart = (partId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId]
    );
  };

  const handleUpdateStatus = async (partId: string, isActive: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({ partId, isActive });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedParts.length === 0) return;

    try {
      await bulkActionMutation.mutateAsync({
        action,
        partIds: selectedParts,
      });
      setSelectedParts([]);
    } catch (error) {
      console.error("Failed to perform bulk action:", error);
    }
  };

  const handleExport = (options: any) => {
    exportToExcel(parts, options);
    setShowExportDialog(false);
  };

  const clearFilters = () => {
    setFilters({
      searchText: "",
      category: "all",
      brand: "all",
      isActive: "all",
      availability: "all",
      priceRange: { min: 0, max: 10000 },
      dateRange: { start: "", end: "" },
      createdBy: "all",
    });
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "priceRange") return value.min > 0 || value.max < 10000;
      if (key === "dateRange") return value.start || value.end;
      return value && value !== "all" && value !== "";
    }).length;
  };

  // Render functions
  const renderActiveStatus = (isActive: boolean) => (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive ? "text-green-600 bg-green-50" : "text-gray-600 bg-gray-50"
      }`}
    >
      {isActive ? (
        <Power className="h-3 w-3 mr-1" />
      ) : (
        <PowerOff className="h-3 w-3 mr-1" />
      )}
      {isActive ? "Active" : "Inactive"}
    </div>
  );

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-md mx-auto shadow-sm">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Parts
          </h3>
          <p className="text-gray-600 mb-4">
            {error?.message || "Something went wrong"}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Parts Management
              </h1>
              <p className="text-gray-600">
                Manage your parts inventory and catalog
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => exportFilteredData(parts, filters)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Part</span>
              </motion.button>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 text-gray-600 ${
                    isFetching ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Parts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.total.toLocaleString()}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${statistics.stockValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics.totalStockQty.toLocaleString()}
                </p>
              </div>
              <Warehouse className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statistics.lowStock}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">
                  {statistics.categories}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-green-600">
                  ${statistics.avgPrice.toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedParts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedParts.length} parts selected
                </span>
                <button
                  onClick={() => setSelectedParts([])}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Table Header with Integrated Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Parts List</h3>
                <div className="flex items-center space-x-2">
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {getActiveFilterCount()} filters
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear Filters
                  </button>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>

              {/* Compact Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search parts..."
                    value={filters.searchText}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchText: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category */}
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Brand */}
                <select
                  value={filters.brand}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      brand: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand ?? ""}>
                      {brand}
                    </option>
                  ))}
                </select>

                {/* Status */}
                <select
                  value={filters.isActive}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isActive: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                {/* Price Range */}
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: {
                          ...prev.priceRange,
                          min: Number(e.target.value),
                        },
                      }))
                    }
                    className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: {
                          ...prev.priceRange,
                          max: Number(e.target.value),
                        },
                      }))
                    }
                    className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Results Info */}
                <div className="flex items-center text-sm text-gray-600">
                  Showing {parts.length} of {totalCount} parts
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading parts...</p>
            </div>
          )}

          {/* Table Content */}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          column.width ? `w-[${column.width}]` : ""
                        }`}
                      >
                        {column.key === "select" ? (
                          <button
                            onClick={handleSelectAll}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {selectedParts.length === parts.length &&
                            parts.length > 0 ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        ) : column.sortable ? (
                          <button
                            onClick={() => handleSort(column.key)}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>{column.label}</span>
                            {sortConfig.key === column.key ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </button>
                        ) : (
                          column.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parts.map((part) => (
                    <motion.tr
                      key={part.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Select */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSelectPart(part.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {selectedParts.includes(part.id) ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Part Number */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {part.partNumber}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {part.name}
                        </div>
                        {part.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {part.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {part.category}
                        </div>
                        {part.subcategory && (
                          <div className="text-xs text-gray-500">
                            {part.subcategory}
                          </div>
                        )}
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {part.brand || "N/A"}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {part.priceFormatted}
                        </div>
                        {part.discountNumber > 0 && (
                          <div className="text-xs text-green-600">
                            -{part.discountFormatted}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <div className={`font-semibold ${
                          part.stockQty < 10 ? "text-red-600" : 
                          part.stockQty < 50 ? "text-yellow-600" : "text-green-600"
                        }`}>
                          {part.stockQty}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {renderActiveStatus(part.isActive)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-700 p-1 rounded"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-700 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(part.id, !part.isActive)
                            }
                            className={`p-1 rounded ${
                              part.isActive
                                ? "text-yellow-600 hover:text-yellow-700"
                                : "text-green-600 hover:text-green-700"
                            }`}
                            title={part.isActive ? "Deactivate" : "Activate"}
                          >
                            {part.isActive ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-700 p-1 rounded"
                            title="More"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && parts.length === 0 && (
            <div className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No parts found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                  results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Dialog */}
      <AnimatePresence>
        {showExportDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setShowExportDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Export Options
                </h3>
                <button
                  onClick={() => setShowExportDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50">
                      Excel (.xlsx)
                    </button>
                    <button className="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50">
                      CSV (.csv)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">Images</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 mr-2"
                        defaultChecked
                      />
                      <span className="text-sm">All columns</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() =>
                      handleExport({
                        format: "xlsx",
                        includeImages: false,
                        selectedColumns: [],
                      })
                    }
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => setShowExportDialog(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPartsPage;