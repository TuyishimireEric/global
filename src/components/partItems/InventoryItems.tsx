"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Search,
  MoreHorizontal,
  MapPin,
  Calendar,
  Building2,
  Barcode,
  Archive,
  RefreshCw,
  Grid3X3,
  List,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { usePartItems } from "@/hooks/items/usePartItems";
import PartItemForm from "./ItemsForm";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { CompanyI } from "@/types";

// Updated interface to match API response
interface PartItem {
  id: string;
  partId: string;
  barCode: string;
  serialNumber?: string | null;
  location: string;
  shelveLocation: string; // Note: API uses shelveLocation, not shelvingLocation
  supplierId?: string | null;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
  expiryDate?: string | null;
  warrantyPeriod?: number | null;
  condition: "new" | "refurbished" | "used" | "damaged";
  status: "available" | "reserved" | "sold" | "damaged" | "maintenance";
  quotationId?: string | null;
  notes?: string | null;
  addedBy: string;
  updatedBy?: string | null;
  addedOn: string;
  updatedOn: string;
}

export const InventoryItems = ({ partId }: { partId: string }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [createNew, setCreateNew] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<PartItem | null>(null);

  const { data: suppliers, isLoading: suppliersLoading } = useCompanies({
    type: "supplier",
  });

  const getSupplier = (supplierId: string) => {
    return suppliers?.find((supply) => supply.id == supplierId);
  };

  const {
    data: itemsData,
    isLoading: itemsLoading,
    refetch,
  } = usePartItems({ partId });

  // Extract items from API response
  const partItems: PartItem[] = itemsData || [];

  // Create a lookup map for suppliers
  const supplierMap = React.useMemo(() => {
    const map = new Map<string, CompanyI>();
    if (suppliers) {
      suppliers?.forEach((supplier: CompanyI) => {
        map.set(supplier.id, supplier);
      });
    }
    return map;
  }, [suppliers]);

  // Filter part items
  const filteredItems = partItems.filter((item) => {
    const supplier = supplierMap.get(item.supplierId || "");

    const matchesSearch =
      item.barCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shelveLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Available",
        icon: CheckCircle,
      },
      reserved: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Reserved",
        icon: Clock,
      },
      sold: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Sold",
        icon: CheckCircle,
      },
      damaged: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Damaged",
        icon: AlertCircle,
      },
      maintenance: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Maintenance",
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.available;
    const Icon = config.icon;

    return (
      <div
        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </div>
    );
  };

  const getConditionBadge = (condition: string) => {
    const conditionConfig = {
      new: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        label: "New",
      },
      refurbished: {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        label: "Refurbished",
      },
      used: {
        color: "bg-slate-100 text-slate-800 border-slate-200",
        label: "Used",
      },
      damaged: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Damaged",
      },
    };

    const config =
      conditionConfig[condition as keyof typeof conditionConfig] ||
      conditionConfig.new;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleEditItem = (item: PartItem) => {
    setSelectedItem(item);
    setCreateNew(true);
  };

  const handleFormClose = () => {
    setCreateNew(false);
    setSelectedItem(null);
  };

  const handleItemSaved = () => {
    refetch(); // Refresh the data after saving
    handleFormClose();
  };

  const calculateTotalValue = () => {
    return partItems.reduce((total, item) => {
      return total + (item.purchasePrice || 0);
    }, 0);
  };

  if (itemsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm w-full p-8 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
          <span className="text-gray-600">Loading inventory items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm w-full overflow-x-auto">
      {/* Header */}
      <div className="px-6 py-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <Package className="h-7 w-7 text-black" />
              <span>Inventory Items</span>
            </h2>
            <p className="text-gray-500 mt-1">
              {filteredItems.length} of {partItems.length} items • Total value $
              {calculateTotalValue().toFixed(2)}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by barcode, location, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent w-full sm:w-64 transition-all duration-300 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="damaged">Damaged</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCreateNew(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Item</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-4 bg-yellow-50 border-b border-yellow-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">
                {selectedItems.length} item
                {selectedItems.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg text-sm font-medium transition-colors"
                >
                  <Archive className="h-4 w-4" />
                  <span>Archive</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm w-full overflow-hidden">
        {partItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No inventory items
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first inventory item for this part.
            </p>
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCreateNew(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </motion.button>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === filteredItems.length &&
                      filteredItems.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barcode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shelf Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added On
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const supplier = supplierMap.get(item.supplierId || "");

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                      />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Barcode className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {item.barCode}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {item.location}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {item.shelveLocation}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {formatDate(item.addedOn)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {supplier ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No supplier
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {getConditionBadge(item.condition)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.purchasePrice ? (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {item.purchasePrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="relative group">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </motion.button>

                          {/* Dropdown Menu */}
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <RefreshCw className="h-4 w-4" />
                                <span>Edit Item</span>
                              </button>
                              <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Archive className="h-4 w-4" />
                                <span>Archive Item</span>
                              </button>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                                <span>Delete Item</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Part Item Form Modal */}
      {createNew && (
        <PartItemForm
          isOpen={createNew}
          onClose={handleFormClose}
          onSave={handleItemSaved}
          suppliers={suppliers || []}
          partId={partId}
        />
      )}
    </div>
  );
};
