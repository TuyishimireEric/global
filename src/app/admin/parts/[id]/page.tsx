"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  MapPin,
  Calendar,
  Barcode,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Save,
  Settings,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Archive,
  Building2,
  User
} from "lucide-react";

// Types
interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
  manufacturer: string;
  price: number;
  description: string;
  specifications: Record<string, string>;
  partNumber: string;
  oem: boolean;
  totalStock: number;
  minStockLevel: number;
  maxStockLevel: number;
}

interface InventoryItem {
  id: string;
  barcode: string;
  location: string;
  addedOn: string;
  status: "available" | "reserved" | "damaged" | "in-transit";
  shelveLocation: string;
  addedBy: string;
  condition: "new" | "used" | "refurbished";
  notes?: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

// Sample data
const samplePart: Part = {
  id: "1",
  name: "Hydraulic Pump Assembly",
  sku: "CAT-320-HP-001",
  category: "Hydraulic System",
  manufacturer: "Caterpillar",
  price: 2450.00,
  description: "High-performance hydraulic pump assembly designed for CAT 320 series excavators. Engineered to deliver optimal flow rates and pressure for maximum excavator performance. Built with premium materials and precision manufacturing for long-lasting durability.",
  specifications: {
    "Flow Rate": "165 L/min",
    "Operating Pressure": "35 MPa",
    "Port Size": "3/4 inch",
    "Material": "Cast Iron with Steel Components",
    "Temperature Range": "-20°C to +80°C",
    "Seal Type": "Nitrile Rubber",
    "Mounting": "SAE Standard",
    "Filtration": "25 micron"
  },
  partNumber: "320-3064",
  oem: true,
  totalStock: 47,
  minStockLevel: 10,
  maxStockLevel: 100
};

const sampleLocations: Location[] = [
  { id: "1", name: "Main Warehouse", address: "123 Industrial Ave, Phoenix, AZ" },
  { id: "2", name: "East Coast DC", address: "456 Logistics Blvd, Atlanta, GA" },
  { id: "3", name: "West Coast DC", address: "789 Supply Chain Dr, Los Angeles, CA" },
  { id: "4", name: "Service Center", address: "321 Repair St, Houston, TX" }
];

const sampleInventoryItems: InventoryItem[] = [
  {
    id: "1",
    barcode: "HP001-001-MW",
    location: "Main Warehouse",
    addedOn: "2024-07-15",
    status: "available",
    shelveLocation: "A-12-03",
    addedBy: "John Smith",
    condition: "new"
  },
  {
    id: "2",
    barcode: "HP001-002-MW",
    location: "Main Warehouse",
    addedOn: "2024-07-15",
    status: "available",
    shelveLocation: "A-12-04",
    addedBy: "John Smith",
    condition: "new"
  },
  {
    id: "3",
    barcode: "HP001-003-EC",
    location: "East Coast DC",
    addedOn: "2024-07-12",
    status: "reserved",
    shelveLocation: "B-05-12",
    addedBy: "Sarah Johnson",
    condition: "new",
    notes: "Reserved for order #12345"
  },
  {
    id: "4",
    barcode: "HP001-004-WC",
    location: "West Coast DC",
    addedOn: "2024-07-10",
    status: "available",
    shelveLocation: "C-08-07",
    addedBy: "Mike Wilson",
    condition: "refurbished"
  },
  {
    id: "5",
    barcode: "HP001-005-MW",
    location: "Main Warehouse",
    addedOn: "2024-07-08",
    status: "damaged",
    shelveLocation: "D-01-15",
    addedBy: "John Smith",
    condition: "used",
    notes: "Hydraulic leak detected"
  },
  {
    id: "6",
    barcode: "HP001-006-SC",
    location: "Service Center",
    addedOn: "2024-07-05",
    status: "in-transit",
    shelveLocation: "TRANSIT",
    addedBy: "Lisa Chen",
    condition: "new",
    notes: "Shipping to customer location"
  }
];

const AdminPartDetail: React.FC = () => {
  const [part] = useState<Part>(samplePart);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(sampleInventoryItems);
  const [locations] = useState<Location[]>(sampleLocations);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  
  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Form state for new item
  const [newItem, setNewItem] = useState({
    barcode: "",
    location: "",
    shelveLocation: "",
    condition: "new" as const,
    notes: ""
  });

  // Filter inventory items
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.shelveLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === "all" || item.location === locationFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
    
    return matchesSearch && matchesLocation && matchesStatus && matchesCondition;
  });

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "available":
        return { icon: CheckCircle, color: "text-green-600 bg-green-50", label: "Available" };
      case "reserved":
        return { icon: Clock, color: "text-blue-600 bg-blue-50", label: "Reserved" };
      case "damaged":
        return { icon: AlertCircle, color: "text-red-600 bg-red-50", label: "Damaged" };
      case "in-transit":
        return { icon: Package, color: "text-purple-600 bg-purple-50", label: "In Transit" };
      default:
        return { icon: AlertCircle, color: "text-gray-600 bg-gray-50", label: status };
    }
  };

  // Get condition badge color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-700";
      case "used":
        return "bg-yellow-100 text-yellow-700";
      case "refurbished":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Handle add new item
  const handleAddItem = () => {
    if (!newItem.barcode || !newItem.location || !newItem.shelveLocation) {
      return;
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      barcode: newItem.barcode,
      location: newItem.location,
      addedOn: new Date().toISOString().split('T')[0],
      status: "available",
      shelveLocation: newItem.shelveLocation,
      addedBy: "Current User", // This would come from auth context
      condition: newItem.condition,
      notes: newItem.notes || undefined
    };

    setInventoryItems(prev => [item, ...prev]);
    setNewItem({
      barcode: "",
      location: "",
      shelveLocation: "",
      condition: "new",
      notes: ""
    });
    setShowAddItemModal(false);
  };

  // Handle edit item
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  // Handle delete item
  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // Handle update item status
  const updateItemStatus = (itemId: string, newStatus: InventoryItem['status']) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  // Get stock level color
  const getStockLevelColor = () => {
    if (part.totalStock <= part.minStockLevel) return "text-red-600";
    if (part.totalStock >= part.maxStockLevel) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Part Administration
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-gray-600 text-sm">SKU:</span>
                  <span className="font-mono text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    {part.sku}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Product</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Part</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Part Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Part Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{part.name}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Part #: <span className="font-mono">{part.partNumber}</span></span>
                    <span>Category: {part.category}</span>
                    <span>Manufacturer: {part.manufacturer}</span>
                    {part.oem && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                        OEM
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{part.description}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(part.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">{key}</span>
                      <span className="font-mono text-sm text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stock Overview */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Stock Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Stock</span>
                    <span className={`font-bold text-lg ${getStockLevelColor()}`}>
                      {part.totalStock}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Min Level</span>
                    <span className="text-gray-900">{part.minStockLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Max Level</span>
                    <span className="text-gray-900">{part.maxStockLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Unit Price</span>
                    <span className="text-gray-900 font-bold">${part.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2">Stock Status</h4>
                {part.totalStock <= part.minStockLevel ? (
                  <p className="text-red-600 text-sm">⚠️ Low stock level reached</p>
                ) : part.totalStock >= part.maxStockLevel ? (
                  <p className="text-blue-600 text-sm">📦 Maximum stock level reached</p>
                ) : (
                  <p className="text-green-600 text-sm">✅ Stock levels normal</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Management */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Inventory Items</h2>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddItemModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </motion.button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by barcode, shelf location, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.name}>{location.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="damaged">Damaged</option>
                <option value="in-transit">In Transit</option>
              </select>

              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Conditions</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barcode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shelf Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Barcode className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-900">{item.barcode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{item.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-900">{item.shelveLocation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{item.addedOn}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                          {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{item.addedBy}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>

                          {/* Quick status change */}
                          <select
                            value={item.status}
                            onChange={(e) => updateItemStatus(item.id, e.target.value as InventoryItem['status'])}
                            className="text-xs border border-gray-200 rounded px-2 py-1"
                          >
                            <option value="available">Available</option>
                            <option value="reserved">Reserved</option>
                            <option value="damaged">Damaged</option>
                            <option value="in-transit">In Transit</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or add a new item.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddItemModal(true)}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Item</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Add New Inventory Item</h3>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode *
                  </label>
                  <input
                    type="text"
                    value={newItem.barcode}
                    onChange={(e) => setNewItem(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="e.g., HP001-007-MW"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <select
                    value={newItem.location}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.name}>{location.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shelf Location *
                  </label>
                  <input
                    type="text"
                    value={newItem.shelveLocation}
                    onChange={(e) => setNewItem(prev => ({ ...prev, shelveLocation: e.target.value }))}
                    placeholder="e.g., A-12-05"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={newItem.condition}
                    onChange={(e) => setNewItem(prev => ({ ...prev, condition: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this item..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddItem}
                  disabled={!newItem.barcode || !newItem.location || !newItem.shelveLocation}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Add Item
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {showEditModal && editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Edit Inventory Item</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={editingItem.barcode}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, barcode: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={editingItem.location}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {locations.map(location => (
                      <option key={location.id} value={location.name}>{location.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    value={editingItem.shelveLocation}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, shelveLocation: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, status: e.target.value as InventoryItem['status'] }) : null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="damaged">Damaged</option>
                    <option value="in-transit">In Transit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={editingItem.condition}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, condition: e.target.value as InventoryItem['condition'] }) : null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editingItem.notes || ""}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (editingItem) {
                      setInventoryItems(prev => 
                        prev.map(item => 
                          item.id === editingItem.id ? editingItem : item
                        )
                      );
                      setShowEditModal(false);
                      setEditingItem(null);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPartDetail;