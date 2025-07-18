"use client";

// Types and Interfaces
export interface PartItem {
  id: string;
  partId: string;
  barcode: string;
  location: string;
  status: "available" | "reserved" | "damaged" | "maintenance";
  dateAdded: string;
  lastUpdated: string;
  notes?: string;
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  category: string;
  manufacturer: string;
  series: string;
  price: number;
  listPrice?: number;
  image: string;
  availability: "in-stock" | "low-stock" | "out-stock" | "on-order";
  stockQty: number;
  leadTime: string;
  minOrder: number;
  weight: number;
  dimensions: string;
  compatibility: string[];
  supersedes: string[];
  description: string;
  discount?: number;
  rating?: number;
  reviews?: number;
  featured?: boolean;
}

// Mock data for items
const mockItems: PartItem[] = [
  {
    id: "item-1",
    partId: "1",
    barcode: "CAT001001",
    location: "A1-B2-C3",
    status: "available",
    dateAdded: "2024-01-15",
    lastUpdated: "2024-01-15",
    notes: "New arrival",
  },
  {
    id: "item-2",
    partId: "1",
    barcode: "CAT001002",
    location: "A1-B2-C4",
    status: "available",
    dateAdded: "2024-01-15",
    lastUpdated: "2024-01-15",
  },
  {
    id: "item-3",
    partId: "1",
    barcode: "CAT001003",
    location: "A1-B3-C1",
    status: "reserved",
    dateAdded: "2024-01-10",
    lastUpdated: "2024-01-18",
    notes: "Reserved for Order #12345",
  },
  {
    id: "item-4",
    partId: "1",
    barcode: "CAT001004",
    location: "A1-B3-C2",
    status: "available",
    dateAdded: "2024-01-08",
    lastUpdated: "2024-01-08",
  },
  {
    id: "item-5",
    partId: "1",
    barcode: "CAT001005",
    location: "A2-B1-C1",
    status: "damaged",
    dateAdded: "2024-01-05",
    lastUpdated: "2024-01-16",
    notes: "Minor damage on housing",
  },
];

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Truck,
  AlertTriangle,
  Plus,
  QrCode,
  MapPin,
  Search,
  Save,
  X,
} from "lucide-react";
import {
  PageHeader,
  ActionButton,
  StatusBadge,
  Card,
} from "../../../../components/ui";
import { getPartById } from "@/utils/constants";


const PartDetailPage: React.FC = () => {
  const params = useParams();
  const partId = params.id as string;
  const [activeTab, setActiveTab] = useState<"overview" | "items">("overview");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const part = getPartById(partId);
  const items = mockItems.filter((item) => item.partId === partId);

  if (!part) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Part Not Found</h3>
        <p className="text-gray-600 mb-4">
          The part you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/admin/parts">
          <ActionButton
            icon={ArrowLeft}
            label="Back to Parts"
            variant="outline"
          />
        </Link>
      </div>
    );
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: "text-red-600", label: "Out of Stock" };
    if (stock <= 5) return { color: "text-red-600", label: "Critical" };
    if (stock <= 10) return { color: "text-yellow-600", label: "Low Stock" };
    return { color: "text-green-600", label: "In Stock" };
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "reserved":
        return "bg-blue-100 text-blue-800";
      case "damaged":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stockStatus = getStockStatus(part.stockQty);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ItemEditRow = ({ item }: { item: PartItem }) => (
    <tr className="bg-blue-50">
      <td colSpan={6} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barcode
            </label>
            <input
              type="text"
              defaultValue={item.barcode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              defaultValue={item.location}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              defaultValue={item.status}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="damaged">Damaged</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              defaultValue={item.notes || ""}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-3 flex space-x-2">
            <ActionButton
              label="Save"
              icon={Save}
              variant="primary"
              onClick={() => setEditingItem(null)}
            />
            <ActionButton
              label="Cancel"
              icon={X}
              variant="outline"
              onClick={() => setEditingItem(null)}
            />
          </div>
        </div>
      </td>
    </tr>
  );

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Information */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Part Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Name
              </label>
              <p className="text-lg font-semibold text-gray-900">{part.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <p className="text-gray-900">{part.sku}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <p className="text-gray-900">{part.category}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <p className="text-gray-900">{part.manufacturer}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Series
              </label>
              <p className="text-gray-900">{part.series}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <StatusBadge status={part.availability} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Inventory & Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Current Stock
                </span>
              </div>
              <p className={`text-2xl font-bold ${stockStatus.color}`}>
                {part.stockQty}
              </p>
              <p className={`text-sm ${stockStatus.color}`}>
                {stockStatus.label}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Unit Price
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${part.price.toFixed(2)}
              </p>
              {part.listPrice && (
                <p className="text-sm text-gray-500 line-through">
                  ${part.listPrice.toFixed(2)}
                </p>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Total Value
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${(part.price * part.stockQty).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Technical Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <p className="text-gray-900">{part.weight} lbs</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions
              </label>
              <p className="text-gray-900">{part.dimensions}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Time
              </label>
              <p className="text-gray-900">{part.leadTime}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order
              </label>
              <p className="text-gray-900">{part.minOrder} units</p>
            </div>
          </div>
          {part.description && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-gray-900">{part.description}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <ActionButton
              icon={Package}
              label="Update Stock"
              variant="secondary"
              onClick={() => {}}
            />
            <ActionButton
              icon={DollarSign}
              label="Update Price"
              variant="secondary"
              onClick={() => {}}
            />
            <ActionButton
              icon={Truck}
              label="Reorder"
              variant="secondary"
              onClick={() => {}}
            />
            <ActionButton
              icon={QrCode}
              label="View Items"
              variant="primary"
              onClick={() => setActiveTab("items")}
            />
          </div>
        </Card>

        {part.stockQty <= 10 && (
          <Card>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Low Stock Warning</h4>
                <p className="text-sm text-gray-600 mt-1">
                  This part is running low on stock. Consider reordering soon.
                </p>
                <ActionButton
                  icon={Truck}
                  label="Reorder Now"
                  variant="primary"
                  onClick={() => {}}
                />
              </div>
            </div>
          </Card>
        )}

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Supplier Info
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Lead Time:
              </span>
              <p className="text-gray-900">{part.leadTime}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">
                Min Order:
              </span>
              <p className="text-gray-900">{part.minOrder} units</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderItemsTab = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Part Items</h3>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <ActionButton
              icon={Plus}
              label="Add Item"
              variant="primary"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by barcode or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="damaged">Damaged</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Barcode
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Location
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Date Added
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Notes
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <QrCode className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm">
                          {item.barcode}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{item.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getItemStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(item.dateAdded).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {item.notes || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingItem === item.id && <ItemEditRow item={item} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No items found matching your criteria.
            </p>
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={part.name}
        description={`SKU: ${part.sku} • Category: ${part.category} • ${items.length} items`}
      >
        <Link href="/admin/parts">
          <ActionButton icon={ArrowLeft} label="Back" variant="outline" />
        </Link>
        <Link href={`/admin/parts/${part.id}/edit`}>
          <ActionButton icon={Edit} label="Edit Part" variant="secondary" />
        </Link>
        <ActionButton icon={Trash2} label="Delete" variant="danger" />
      </PageHeader>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("items")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "items"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Items ({items.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? renderOverviewTab() : renderItemsTab()}
    </div>
  );
};

export default PartDetailPage;
