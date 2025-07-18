"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  Package,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit3,
  Copy,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Scan,
  Archive,
} from "lucide-react";

interface PartFormData {
  // Basic Information
  name: string;
  sku: string;
  partNumber: string;
  category: string;
  manufacturer: string;
  model: string;
  year: string;
  description: string;

  // Pricing & Financial
  price: string;
  costPrice: string;
  listPrice: string;
  currency: string;

  // Stock Management (calculated from PartItems)
  minStock: string;
  maxStock: string;
  reorderLevel: string;

  // Supplier Information
  supplier: string;
  supplierPartNumber: string;
  supplierContact: string;
  supplierEmail: string;
  supplierPhone: string;

  // Physical Properties
  weight: string;
  dimensions: string;
  color: string;
  material: string;

  // Ordering & Logistics
  minOrderQuantity: string;
  maxOrderQuantity: string;
  leadTime: string;
  shippingClass: string;
  hazardous: boolean;

  // Warranty & Support
  warranty: string;
  installation: string;
  maintenanceSchedule: string;

  // Compatibility
  compatibility: string[];

  // Status & Flags
  status: string;
  featured: boolean;
  oem: boolean;

  // Additional
  notes: string;
  tags: string[];
  images: File[];
}

interface PartItem {
  id: string;
  partId: string; // References the main Part
  barcode: string;
  location: string;
  status: string;
  dateAdded: string;
  lastUpdated: string;
}

const EnhancedPartCreation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "items">("basic");
  const [formData, setFormData] = useState<PartFormData>({
    name: "",
    sku: "",
    partNumber: "",
    category: "",
    manufacturer: "",
    model: "",
    year: "",
    description: "",
    price: "",
    costPrice: "",
    listPrice: "",
    currency: "USD",
    minStock: "",
    maxStock: "",
    reorderLevel: "",
    supplier: "",
    supplierPartNumber: "",
    supplierContact: "",
    supplierEmail: "",
    supplierPhone: "",
    weight: "",
    dimensions: "",
    color: "",
    material: "",
    minOrderQuantity: "1",
    maxOrderQuantity: "",
    leadTime: "",
    shippingClass: "",
    hazardous: false,
    warranty: "",
    installation: "",
    maintenanceSchedule: "",
    compatibility: [],
    status: "active",
    featured: false,
    oem: false,
    notes: "",
    tags: [],
    images: [],
  });

  // Sample PartItems - In real app, these would be linked by partId
  const [partItems, setPartItems] = useState<PartItem[]>([
    {
      id: "1",
      partId: "PART-001", // Would reference the actual part ID
      barcode: "CAT320HP001",
      location: "A1-B2-C3",
      status: "available",
      dateAdded: "2024-07-15",
      lastUpdated: "2024-07-15",
    },
    {
      id: "2",
      partId: "PART-001",
      barcode: "CAT320HP002",
      location: "A1-B2-C4",
      status: "available",
      dateAdded: "2024-07-14",
      lastUpdated: "2024-07-16",
    },
    {
      id: "3",
      partId: "PART-001",
      barcode: "CAT320HP003",
      location: "A1-B3-C1",
      status: "reserved",
      dateAdded: "2024-07-13",
      lastUpdated: "2024-07-17",
    },
  ]);

  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<PartItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<PartItem>>({
    barcode: "",
    location: "",
    status: "available",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const categories = [
    "Hydraulics",
    "Engine",
    "Undercarriage",
    "Attachment",
    "Electrical",
    "Transmission",
    "Cooling System",
    "Filtration",
    "Fuel System",
    "Brake System",
    "Steering",
    "Suspension",
    "Exhaust",
    "Interior",
    "Other",
  ];

  const manufacturers = [
    "Caterpillar",
    "Komatsu",
    "Volvo",
    "Hitachi",
    "John Deere",
    "Case",
    "Kubota",
    "Bobcat",
    "JCB",
    "Liebherr",
    "Doosan",
    "Other",
  ];

  const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
  const statuses = ["active", "inactive", "discontinued", "pending"];
 
  const itemStatuses = [
    "available",
    "reserved",
    "damaged",
    "maintenance",
    "sold",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Creating part:", formData);
      console.log("Part items:", partItems);
      alert("Part created successfully!");
    } catch (error) {
      console.error("Error creating part:", error);
      alert("Error creating part. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateBarcode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${formData.sku || "PART"}${timestamp}${random}`;
  };

  const addPartItem = () => {
    if (newItem.barcode && newItem.location) {
      const item: PartItem = {
        id: Date.now().toString(),
        partId: "PART-001", // Would be the actual part ID
        barcode: newItem.barcode!,
        location: newItem.location!,
        status: newItem.status as
          | "available"
          | "reserved"
          | "damaged"
          | "maintenance"
          | "sold",
        dateAdded: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
      };

      setPartItems((prev) => [...prev, item]);
      setNewItem({
        barcode: "",
        location: "",
        status: "available",
      });
      setShowAddItem(false);
    }
  };

  const updatePartItem = (id: string, updatedItem: Partial<PartItem>) => {
    setPartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedItem,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );
    setEditingItem(null);
  };

  const deletePartItem = (id: string) => {
    setPartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const duplicatePartItem = (item: PartItem) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      barcode: generateBarcode(),
      dateAdded: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setPartItems((prev) => [...prev, newItem]);
  };

  const filteredItems = partItems.filter((item) => {
    const matchesSearch =
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const isFormValid =
    formData.name && formData.sku && formData.category && formData.price;

  // Calculate quantities from PartItems
  const totalQuantity = partItems.length;
  const availableQuantity = partItems.filter(
    (item) => item.status === "available"
  ).length;
  const reservedQuantity = partItems.filter(
    (item) => item.status === "reserved"
  ).length;
  const damagedQuantity = partItems.filter(
    (item) => item.status === "damaged"
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "reserved":
        return "bg-blue-100 text-blue-800";
      case "damaged":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-300">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white">
                  Create New Part
                </h1>
                <p className="text-yellow-100 text-sm">
                  Add part with inventory items
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                className="bg-white text-yellow-600 hover:bg-yellow-50 disabled:bg-gray-200 disabled:text-gray-400 px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center space-x-2 shadow-md"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Part</span>
                  </>
                )}
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-all duration-300">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("basic")}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 ${
                activeTab === "basic"
                  ? "border-b-2 border-yellow-500 text-yellow-600 bg-yellow-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Part Information</span>
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 ${
                activeTab === "items"
                  ? "border-b-2 border-yellow-500 text-yellow-600 bg-yellow-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <QrCode className="h-5 w-5" />
              <span>Inventory Items</span>
              <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-bold">
                {totalQuantity}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "basic" ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Package className="h-6 w-6 text-yellow-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Basic Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Part Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Enter part name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU *
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="CAT-HYD-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Part Number
                      </label>
                      <input
                        type="text"
                        name="partNumber"
                        value={formData.partNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="320-3064"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manufacturer
                      </label>
                      <select
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="">Select manufacturer</option>
                        {manufacturers.map((mfg) => (
                          <option key={mfg} value={mfg}>
                            {mfg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model/Year
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="320D (2020-2024)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleChange}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Featured
                        </span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="oem"
                          checked={formData.oem}
                          onChange={handleChange}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          OEM
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Detailed description of the part..."
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                    <h2 className="text-xl font-bold text-gray-900">Pricing</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          name="costPrice"
                          value={formData.costPrice}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        List Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          name="listPrice"
                          value={formData.listPrice}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        {currencies.map((curr) => (
                          <option key={curr} value={curr}>
                            {curr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <ImageIcon className="h-6 w-6 text-yellow-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Product Images
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Click to upload images or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <FileText className="h-6 w-6 text-yellow-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Additional Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight
                      </label>
                      <input
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="45.2 kg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="420mm x 280mm x 350mm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material
                      </label>
                      <input
                        type="text"
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Cast Iron, Steel, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warranty Period
                      </label>
                      <input
                        type="text"
                        name="warranty"
                        value={formData.warranty}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="24 months / 2000 hours"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lead Time (days)
                      </label>
                      <input
                        type="number"
                        name="leadTime"
                        value={formData.leadTime}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="7"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Order Qty
                      </label>
                      <input
                        type="number"
                        name="minOrderQuantity"
                        value={formData.minOrderQuantity}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Additional notes, special handling instructions, etc."
                    />
                  </div>
                </div>
              </form>
            ) : (
              /* Inventory Items Tab */
              <div className="space-y-6">
                {/* Items Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Inventory Items
                    </h2>
                    <p className="text-gray-600">
                      Manage individual physical items with barcodes and
                      locations
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Quantity Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          Total Quantity
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {totalQuantity}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          Available
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {availableQuantity}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <Archive className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-yellow-600">
                          Reserved
                        </p>
                        <p className="text-2xl font-bold text-yellow-700">
                          {reservedQuantity}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-600">
                          Damaged
                        </p>
                        <p className="text-2xl font-bold text-red-700">
                          {damagedQuantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by barcode or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none bg-white"
                        >
                          <option value="all">All Status</option>
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="damaged">Damaged</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="sold">Sold</option>
                        </select>
                      </div>
                      <button
                        onClick={() =>
                          setNewItem({ ...newItem, barcode: generateBarcode() })
                        }
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Generate Barcode</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Barcode
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Added
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredItems.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <QrCode className="h-4 w-4 text-gray-400" />
                                <span className="font-mono text-sm font-medium text-gray-900">
                                  {item.barcode}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="font-mono text-sm text-gray-900">
                                  {item.location}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {item.dateAdded}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {item.lastUpdated}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                                  title="Edit item"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => duplicatePartItem(item)}
                                  className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                                  title="Duplicate item"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deletePartItem(item.id)}
                                  className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                                  title="Delete item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                      <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No items found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || filterStatus !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "Start by adding your first inventory item"}
                      </p>
                      {!searchTerm && filterStatus === "all" && (
                        <button
                          onClick={() => setShowAddItem(true)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Add First Item
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        {activeTab === "basic" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Part Summary
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    {isFormValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                    <span>Form {isFormValid ? "Complete" : "Incomplete"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <QrCode className="h-4 w-4 text-blue-500" />
                    <span>{totalQuantity} Items in Stock</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="h-4 w-4 text-purple-500" />
                    <span>{formData.images.length} Images</span>
                  </div>
                </div>
              </div>

              {formData.price && totalQuantity > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    $
                    {(
                      parseFloat(formData.price || "0") * totalQuantity
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {(showAddItem || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <QrCode className="h-6 w-6 text-yellow-600" />
                  <span>
                    {editingItem
                      ? "Edit Inventory Item"
                      : "Add New Inventory Item"}
                  </span>
                </h2>
                <button
                  onClick={() => {
                    setShowAddItem(false);
                    setEditingItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barcode *
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={
                          editingItem ? editingItem.barcode : newItem.barcode
                        }
                        onChange={(e) =>
                          editingItem
                            ? setEditingItem({
                                ...editingItem,
                                barcode: e.target.value,
                              })
                            : setNewItem({
                                ...newItem,
                                barcode: e.target.value,
                              })
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono"
                        placeholder="Enter or generate barcode"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newBarcode = generateBarcode();
                        if (editingItem) {
                          setEditingItem({
                            ...editingItem,
                            barcode: newBarcode,
                          });
                        } else {
                          setNewItem({ ...newItem, barcode: newBarcode });
                        }
                      }}
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                    >
                      <Scan className="h-4 w-4" />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={
                        editingItem ? editingItem.location : newItem.location
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              location: e.target.value,
                            })
                          : setNewItem({ ...newItem, location: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono"
                      placeholder="e.g., A1-B2-C3"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: Aisle-Shelf-Bin (e.g., A1-B2-C3)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingItem ? editingItem.status : newItem.status}
                    onChange={(e) =>
                      editingItem
                        ? setEditingItem({
                            ...editingItem,
                            status: e.target.value,
                          })
                        : setNewItem({
                            ...newItem,
                            status: e.target.value,
                          })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    {itemStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Descriptions */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Status Definitions:
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>
                      <span className="font-medium">Available:</span> Ready for
                      sale or use
                    </p>
                    <p>
                      <span className="font-medium">Reserved:</span> Set aside
                      for specific order
                    </p>
                    <p>
                      <span className="font-medium">Damaged:</span> Needs repair
                      or replacement
                    </p>
                    <p>
                      <span className="font-medium">Maintenance:</span>{" "}
                      Undergoing service or testing
                    </p>
                    <p>
                      <span className="font-medium">Sold:</span> Completed
                      transaction, ready for removal
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowAddItem(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingItem) {
                      updatePartItem(editingItem.id, editingItem);
                    } else {
                      addPartItem();
                    }
                  }}
                  disabled={
                    editingItem
                      ? !editingItem.barcode || !editingItem.location
                      : !newItem.barcode || !newItem.location
                  }
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingItem ? "Update Item" : "Add Item"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPartCreation;
