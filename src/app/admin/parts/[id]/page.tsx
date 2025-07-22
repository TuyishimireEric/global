"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Wrench,
  ChevronRight,
  Eye,
  Truck,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  X,
  Loader2,
  Calendar,
  Barcode,
  Database,
  Users,
  TrendingUp,
  DollarSign,
  Sparkles,
  BarChart3,
  HardHat,
  Activity,
  ToolCase,
} from "lucide-react";
import { usePartById } from "@/hooks/parts/usePartById";
import Link from "next/link";
import { InventoryItems } from "@/components/partItems/InventoryItems";

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

const AdminProductDetails: React.FC = () => {
  const params = useParams();
  const partId = params.id as string;

  const { data: product, isLoading, error } = usePartById(partId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showImageModal, setShowImageModal] = useState(false);

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
  const totalStock = 0;
  const availableStock = 0;
  const reservedStock = 0;
  const averageCost = 0;
  const totalValue = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link
            href={`/admin`}
            className="hover:text-black cursor-pointer transition-colors"
          >
            Admin
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/admin/parts`}
            className="hover:text-black cursor-pointer transition-colors"
          >
            Parts
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cat-blue/10 rounded-lg">
                <Database className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cat-green/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-cat-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableStock}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cat-blue/10 rounded-lg">
                <Clock className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Reserved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservedStock}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cat-yellow/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Product Images - Left Side */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-black" />
                <span>Product Images</span>
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <motion.div
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowImageModal(true)}
                  >
                    <img
                      src={
                        product.images[selectedImage] ||
                        "/api/placeholder/400/400"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-cat-yellow text-black p-2 rounded-lg">
                          <Eye className="h-5 w-5" />
                        </div>
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
                              ? "border-cat-yellow"
                              : "border-gray-200 hover:border-cat-yellow/50"
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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Tab Navigation */}
              <div className="bg-gray-50">
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
                    { id: "analytics", label: "Analytics", icon: BarChart3 },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-all ${
                        activeTab === id
                          ? "border-cat-blue text-black"
                          : "border-transparent text-gray-500 hover:text-gray-700"
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
                      {/* Enhanced Product Overview */}
                      <div className="space-y-6">
                        {/* Header Section */}
                        <div className="bg-cat-blue/5 rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <span className="inline-flex items-center space-x-2 font-mono text-black text-sm font-bold bg-cat-blue/10 px-4 py-2 rounded-lg mb-3">
                                <Barcode className="h-4 w-4" />
                                <span>{product.partNumber}</span>
                              </span>
                              <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">
                                {product.name}
                              </h1>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <HardHat className="h-5 w-5 text-black" />
                                  <span className="text-sm font-medium text-gray-600">
                                    {product.brand}
                                  </span>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    product.isActive
                                      ? "bg-cat-green/20 text-cat-green"
                                      : "bg-cat-red/20 text-cat-red"
                                  }`}
                                >
                                  {product.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 uppercase tracking-wider">
                                Selling Price
                              </p>
                              <p className="text-3xl font-bold text-black">
                                ${parseFloat(product.price).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-700 leading-relaxed text-lg">
                            {product.description}
                          </p>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-cat-blue/5 rounded-lg p-4"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <Activity className="h-5 w-5 text-black" />
                              <span className="text-sm font-medium text-black">
                                Cost Price
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              ${parseFloat(product.costPrice).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Per unit cost
                            </p>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-cat-green/5 rounded-lg p-4"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <TrendingUp className="h-5 w-5 text-cat-green" />
                              <span className="text-sm font-medium text-cat-green">
                                Profit Margin
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {(
                                ((parseFloat(product.price) -
                                  parseFloat(product.costPrice)) /
                                  parseFloat(product.price)) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Gross margin
                            </p>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-cat-yellow/5 rounded-lg p-4"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <DollarSign className="h-5 w-5 text-black" />
                              <span className="text-sm font-medium text-black">
                                Potential Revenue
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              $
                              {(
                                parseFloat(product.price) * availableStock
                              ).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              From available stock
                            </p>
                          </motion.div>
                        </div>

                        {/* Product Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-cat-yellow/5 rounded-lg p-5">
                            <div className="flex items-center space-x-2 mb-3">
                              <Shield className="h-5 w-5 text-black" />
                              <h4 className="font-bold text-gray-900">
                                Quality Assurance
                              </h4>
                            </div>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-cat-green mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  OEM certified quality standards
                                </span>
                              </li>
                              <li className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-cat-green mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Rigorous testing procedures
                                </span>
                              </li>
                              <li className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-cat-green mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  12-month warranty coverage
                                </span>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-cat-blue/5 rounded-lg p-5">
                            <div className="flex items-center space-x-2 mb-3">
                              <ToolCase className="h-5 w-5 text-black" />
                              <h4 className="font-bold text-gray-900">
                                Technical Support
                              </h4>
                            </div>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-cat-green mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  24/7 technical assistance
                                </span>
                              </li>
                              <li className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-cat-green mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Installation guidance
                                </span>
                              </li>
                              <li className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-cat-green mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Remote diagnostics available
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Additional Information Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <p className="text-xs text-gray-500">Category</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {product.category}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.subcategory}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Truck className="h-4 w-4 text-gray-500" />
                              <p className="text-xs text-gray-500">Weight</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {product.weight} kg
                            </p>
                            <p className="text-xs text-gray-500">
                              Shipping weight
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <p className="text-xs text-gray-500">
                                Created By
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {product.createdBy.firstName}{" "}
                              {product.createdBy.lastName}
                            </p>
                            <p className="text-xs text-gray-500">Admin user</p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <p className="text-xs text-gray-500">Added</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(product.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {/* Performance Alert */}
                        <div className="bg-cat-green/5 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Activity className="h-5 w-5 text-cat-green mt-0.5" />
                            <div>
                              <h4 className="font-bold text-cat-green mb-1">
                                High Performance Part
                              </h4>
                              <p className="text-gray-700 text-sm">
                                This product shows strong demand with{" "}
                                {availableStock} units in stock. Consider
                                monitoring inventory levels closely to maintain
                                availability.
                              </p>
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

        <InventoryItems partId={product.id} />
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
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
                className="absolute top-4 right-4 bg-white text-black p-2 rounded-full hover:bg-white transition-colors z-10"
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
