"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Minus,
  Share2,
  FileText,
  Zap,
  Star,
  Package,
  Wrench,
  ChevronRight,
  Eye,
  Heart,
  Truck,
  Shield,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Phone,
  Mail,
  Settings,
  X,
  Loader2,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Calendar,
  Building2,
  Barcode,
  Archive,
  RefreshCw,
  ExternalLink,
  Database,
  Users,
  TrendingUp,
  DollarSign,
  Grid3X3,
  List,
  SortAsc,
  Copy,
} from "lucide-react";
import { usePartById } from "@/hooks/parts/usePartById";

// Real API data types
interface CreatedBy {
  id: string;
  firstName: string;
  lastName: string;
}

interface Dimensions {
  unit: string;
  height: number;
  diameter: number;
}

interface Part {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  compatibleModels: string[];
  specifications: Record<string, string>;
  images: string[];
  price: string;
  discount: string;
  costPrice: string;
  weight: string;
  dimensions: Dimensions;
  minimumStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: CreatedBy;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface PartItem {
  id: string;
  barCode: string;
  location: string;
  shelvingLocation: string;
  addedOn: string;
  supplier: Supplier;
  status: "available" | "reserved" | "sold" | "damaged";
  condition: "new" | "refurbished" | "used";
  purchasePrice: string;
  serialNumber?: string;
  notes?: string;
}

// Mock data for part items (replace with real API call)
const mockPartItems: PartItem[] = [
  {
    id: "1",
    barCode: "1R0749001",
    location: "Warehouse A",
    shelvingLocation: "A-15-B3",
    addedOn: "2024-06-15T10:30:00Z",
    supplier: {
      id: "s1",
      name: "CAT Authorized Dealer",
      contactPerson: "John Smith",
      email: "john@catdealer.com",
      phone: "+1-555-0123",
    },
    status: "available",
    condition: "new",
    purchasePrice: "62.75",
    serialNumber: "CAT1R0749SN001",
    notes: "Direct from manufacturer",
  },
  {
    id: "2",
    barCode: "1R0749002",
    location: "Warehouse A",
    shelvingLocation: "A-15-B4",
    addedOn: "2024-06-10T14:20:00Z",
    supplier: {
      id: "s1",
      name: "CAT Authorized Dealer",
      contactPerson: "John Smith",
      email: "john@catdealer.com",
      phone: "+1-555-0123",
    },
    status: "available",
    condition: "new",
    purchasePrice: "62.75",
    serialNumber: "CAT1R0749SN002",
  },
  {
    id: "3",
    barCode: "1R0749003",
    location: "Warehouse B",
    shelvingLocation: "B-08-C1",
    addedOn: "2024-06-05T09:15:00Z",
    supplier: {
      id: "s2",
      name: "Global Parts Supply",
      contactPerson: "Sarah Wilson",
      email: "sarah@globalparts.com",
      phone: "+1-555-0456",
    },
    status: "reserved",
    condition: "new",
    purchasePrice: "58.90",
    serialNumber: "CAT1R0749SN003",
    notes: "Reserved for Order #ORD-2024-1205",
  },
  {
    id: "4",
    barCode: "1R0749004",
    location: "Warehouse A",
    shelvingLocation: "A-15-B5",
    addedOn: "2024-05-28T16:45:00Z",
    supplier: {
      id: "s3",
      name: "Reman Solutions Inc",
      contactPerson: "Mike Johnson",
      email: "mike@remansolutions.com",
      phone: "+1-555-0789",
    },
    status: "available",
    condition: "refurbished",
    purchasePrice: "45.20",
    serialNumber: "REM1R0749SN004",
    notes: "Professionally remanufactured",
  },
  {
    id: "5",
    barCode: "1R0749005",
    location: "Warehouse C",
    shelvingLocation: "C-22-A2",
    addedOn: "2024-05-20T11:30:00Z",
    supplier: {
      id: "s1",
      name: "CAT Authorized Dealer",
      contactPerson: "John Smith",
      email: "john@catdealer.com",
      phone: "+1-555-0123",
    },
    status: "damaged",
    condition: "new",
    purchasePrice: "62.75",
    serialNumber: "CAT1R0749SN005",
    notes: "Damaged during shipping - pending inspection",
  },
  {
    id: "6",
    barCode: "1R0749006",
    location: "Warehouse B",
    shelvingLocation: "B-12-A1",
    addedOn: "2024-06-18T08:15:00Z",
    supplier: {
      id: "s2",
      name: "Global Parts Supply",
      contactPerson: "Sarah Wilson",
      email: "sarah@globalparts.com",
      phone: "+1-555-0456",
    },
    status: "available",
    condition: "new",
    purchasePrice: "59.95",
    serialNumber: "CAT1R0749SN006",
    notes: "Bulk order discount applied",
  },
];

const AdminProductDetails: React.FC = () => {
  const params = useParams();
  const partId = params.id as string;

  const { data: product, isLoading, error } = usePartById(partId);
  const [partItems] = useState<PartItem[]>(mockPartItems);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showImageModal, setShowImageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600">
            The requested product could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalStock = partItems.length;
  const availableStock = partItems.filter(
    (item) => item.status === "available"
  ).length;
  const reservedStock = partItems.filter(
    (item) => item.status === "reserved"
  ).length;
  const averageCost =
    partItems.reduce((sum, item) => sum + parseFloat(item.purchasePrice), 0) /
    partItems.length;
  const totalValue = partItems.reduce(
    (sum, item) => sum + parseFloat(item.purchasePrice),
    0
  );

  // Filter part items
  const filteredItems = partItems.filter((item) => {
    const matchesSearch =
      item.barCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shelvingLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="w-full px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span className="hover:text-blue-600 cursor-pointer">Admin</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-blue-600 cursor-pointer">Products</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableStock}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reserved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservedStock}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section with New Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Product Images - Left Side */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Product Images
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <motion.div
                    className="aspect-square bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowImageModal(true)}
                  >
                    <img
                      src={
                        product.images[selectedImage] ||
                        "/api/placeholder/400/400"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/50 text-white p-1.5 rounded-lg backdrop-blur-sm">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Image Thumbnails */}
                  {product.images.length > 1 && (
                    <div className="flex space-x-2 mt-3 overflow-x-auto">
                      {product.images.map((image: string, index: number) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 aspect-square w-16 rounded-lg border-2 overflow-hidden ${
                            selectedImage === index
                              ? "border-blue-500"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs - Right Side */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 bg-gray-50">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Overview", icon: Info },
                    {
                      id: "specifications",
                      label: "Specifications",
                      icon: Settings,
                    },
                    {
                      id: "compatibility",
                      label: "Compatibility",
                      icon: Wrench,
                    },
                    { id: "analytics", label: "Analytics", icon: TrendingUp },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Basic Product Info */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <span className="font-mono text-blue-600 text-sm font-bold bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 mb-3 inline-block">
                          {product.partNumber}
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {product.name}
                        </h1>
                        <div className="flex items-center space-x-2 mb-4">
                          <Award className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {product.brand}
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {/* Pricing Info */}
                        <div className="grid grid-cols-1 gap-3 mt-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                Selling Price
                              </span>
                            </div>
                            <p className="text-xl font-bold text-blue-600">
                              ${parseFloat(product.price).toFixed(2)}
                            </p>
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-900">
                                Cost Price
                              </span>
                            </div>
                            <p className="text-xl font-bold text-green-600">
                              ${parseFloat(product.costPrice).toFixed(2)}
                            </p>
                          </div>

                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-900">
                                Margin
                              </span>
                            </div>
                            <p className="text-xl font-bold text-purple-600">
                              {(
                                ((parseFloat(product.price) -
                                  parseFloat(product.costPrice)) /
                                  parseFloat(product.price)) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Product Overview
                      </h3>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">
                          {product.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <Shield className="h-5 w-5 text-blue-600" />
                              <h4 className="font-bold text-blue-900">
                                Admin Notes
                              </h4>
                            </div>
                            <p className="text-blue-800 text-sm">
                              This product is actively managed in the inventory
                              system. Monitor stock levels and supplier
                              relationships regularly.
                            </p>
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                              <h4 className="font-bold text-green-900">
                                Performance
                              </h4>
                            </div>
                            <p className="text-green-800 text-sm">
                              Strong demand with consistent sales. Consider
                              increasing stock levels for better availability.
                            </p>
                          </div>
                        </div>

                        {/* Key Information */}
                        <div className="grid grid-cols-2 gap-6 mt-8">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Package className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Category
                                </p>
                                <p className="text-sm text-gray-600">
                                  {product.category} → {product.subcategory}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Truck className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Weight
                                </p>
                                <p className="text-sm text-gray-600">
                                  {product.weight} kg
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Users className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Created By
                                </p>
                                <p className="text-sm text-gray-600">
                                  {product.createdBy.firstName}{" "}
                                  {product.createdBy.lastName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Created
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formatDate(product.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "specifications" && (
                    <motion.div
                      key="specifications"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Technical Specifications
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(product.specifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between items-center py-3 border-b border-gray-100"
                            >
                              <span className="font-medium text-gray-700">
                                {key}
                              </span>
                              <span className="text-gray-900 font-mono">
                                value
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-yellow-900 mb-1">
                              Important Note
                            </h4>
                            <p className="text-yellow-800 text-sm">
                              Always verify compatibility with your specific
                              machine model and serial number before ordering.
                              Contact our technical support team if you need
                              assistance.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "compatibility" && (
                    <motion.div
                      key="compatibility"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Compatible Models
                      </h3>
                      <p className="text-gray-600 mb-6">
                        This {product.name.toLowerCase()} is compatible with the
                        following CAT engine models:
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                        {product.compatibleModels.map((model: string) => (
                          <div
                            key={model}
                            className="bg-blue-100 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-center font-bold hover:bg-blue-200 transition-colors"
                          >
                            {model}
                          </div>
                        ))}
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <Wrench className="h-5 w-5 mr-2 text-gray-600" />
                          Installation Guidelines
                        </h4>
                        <div className="space-y-3 text-sm text-gray-700">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
                              Professional installation recommended for optimal
                              performance
                            </span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
                              Ensure fuel system is properly cleaned before
                              installation
                            </span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
                              Use genuine CAT fuel for best filtration results
                            </span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
                              Follow torque specifications in service manual
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "analytics" && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Product Analytics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-200 rounded-lg">
                              <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-900">
                                Avg. Cost
                              </h4>
                              <p className="text-2xl font-bold text-blue-600">
                                ${averageCost.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="text-blue-800 text-sm">
                            Average purchase price across all items
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-green-200 rounded-lg">
                              <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-green-900">
                                Profit Margin
                              </h4>
                              <p className="text-2xl font-bold text-green-600">
                                {(
                                  ((parseFloat(product.price) - averageCost) /
                                    parseFloat(product.price)) *
                                  100
                                ).toFixed(1)}
                                %
                              </p>
                            </div>
                          </div>
                          <p className="text-green-800 text-sm">
                            Based on average cost vs selling price
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-purple-200 rounded-lg">
                              <Package className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-purple-900">
                                Turnover Rate
                              </h4>
                              <p className="text-2xl font-bold text-purple-600">
                                85%
                              </p>
                            </div>
                          </div>
                          <p className="text-purple-800 text-sm">
                            Stock turnover in the last 90 days
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-bold text-gray-900 mb-4">
                            Sales Trend
                          </h4>
                          <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                            <span className="text-gray-600">
                              Chart placeholder
                            </span>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-bold text-gray-900 mb-4">
                            Stock Movement
                          </h4>
                          <div className="h-32 bg-gradient-to-r from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                            <span className="text-gray-600">
                              Chart placeholder
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Inventory Items Section */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <Package className="h-7 w-7 text-blue-600" />
                  <span>Inventory Items</span>
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredItems.length} of {totalStock} items • Total value $
                  {totalValue.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Item</span>
                </motion.button>
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
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 transition-all duration-300"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
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
                className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedItems.length} item
                    {selectedItems.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Archive className="h-4 w-4" />
                      <span>Archive</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Items Display */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === filteredItems.length &&
                        filteredItems.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barcode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shelving
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Barcode className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {item.barCode}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {item.location}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.shelvingLocation}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(item.addedOn)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.supplier.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.supplier.contactPerson}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getConditionBadge(item.condition)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ${parseFloat(item.purchasePrice).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>

                        <div className="relative group">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </motion.button>

                          {/* Dropdown Menu */}
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="py-1">
                              <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <RefreshCw className="h-4 w-4" />
                                <span>Update Status</span>
                              </button>
                              <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Archive className="h-4 w-4" />
                                <span>Archive Item</span>
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                                <span>Delete Item</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>

              <img
                src={
                  product.images[selectedImage] || "/api/placeholder/600/450"
                }
                alt={product.name}
                className="w-full h-full object-contain rounded-lg"
              />

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {product.images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        selectedImage === index
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductDetails;
