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
  ThumbsUp,
  MessageCircle,
  Settings,
  X,
  Loader2,
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

interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
}

interface QuoteItem {
  partId: string;
  quantity: number;
}

// Sample reviews for now (you can replace with real reviews API later)
const sampleReviews: Review[] = [
  {
    id: "1",
    user: "Mike Thompson",
    rating: 5,
    date: "2024-06-15",
    title: "Excellent replacement part",
    content: "Perfect fit for my engine. Installation was straightforward and performance is as good as the original. Highly recommend for anyone needing a fuel filter replacement.",
    verified: true,
    helpful: 12
  },
  {
    id: "2",
    user: "Sarah Johnson",
    rating: 4,
    date: "2024-06-10",
    title: "Good quality, fast delivery",
    content: "Quality seems good so far. Delivery was faster than expected. Only giving 4 stars because it's too early to tell about long-term durability.",
    verified: true,
    helpful: 8
  },
  {
    id: "3",
    user: "Robert Chen",
    rating: 5,
    date: "2024-06-05",
    title: "Perfect OEM replacement",
    content: "Exact OEM specifications. Works perfectly on my C15 engine. The filtration efficiency is exactly as advertised. Worth every penny.",
    verified: true,
    helpful: 15
  }
];

// Sample related products (you can replace with real related products API later)
const relatedProducts: Partial<Part>[] = [
  {
    id: "2",
    name: "Primary Fuel Filter",
    partNumber: "1R-0750",
    brand: "Caterpillar",
    category: "Filtration",
    price: "45.99",
    discount: "10.00",
    images: ["/api/placeholder/300/225"],
    compatibleModels: ["CAT C15", "CAT C13"],
    description: "Primary fuel filter for diesel engines"
  },
  {
    id: "3",
    name: "Fuel Water Separator",
    partNumber: "1R-0751",
    brand: "Caterpillar",
    category: "Filtration",
    price: "156.50",
    discount: "15.00",
    images: ["/api/placeholder/300/225"],
    compatibleModels: ["CAT C15", "CAT C13", "CAT C12"],
    description: "High-efficiency fuel water separator"
  }
];

const ProductDetails: React.FC = () => {
  const params = useParams();
  const partId = params.id as string;
  
  const { data: product, isLoading, error } = usePartById(partId);
  const [reviews] = useState<Review[]>(sampleReviews);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-yellow-600 animate-spin mx-auto mb-4" />
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The requested product could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Calculate pricing
  const priceNumber = parseFloat(product.price);
  const discountNumber = parseFloat(product.discount);
  const listPrice = discountNumber > 0 ? priceNumber + discountNumber : undefined;
  const discountPercent = listPrice ? Math.round((discountNumber / listPrice) * 100) : 0;

  // Mock availability (you can add this to your API later)
  const availability = product.isActive ? "in-stock" : "out-stock";
  const stockQty = 15; // Mock stock quantity

  const addToQuote = (partId: string, qty: number) => {
    setQuoteItems((prev) => {
      const existing = prev.find((item) => item.partId === partId);
      if (existing) {
        return prev.map((item) =>
          item.partId === partId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { partId, quantity: qty }];
    });
  };

  const AvailabilityBadge = ({ availability, stockQty }: { availability: string; stockQty: number }) => {
    const getAvailabilityInfo = () => {
      switch (availability) {
        case "in-stock":
          return { 
            icon: CheckCircle, 
            text: `In Stock (${stockQty} available)`, 
            color: "text-green-600 bg-green-50 border-green-200" 
          };
        case "low-stock":
          return { 
            icon: AlertCircle, 
            text: `Low Stock (${stockQty} left)`, 
            color: "text-orange-600 bg-orange-50 border-orange-200" 
          };
        case "on-order":
          return { 
            icon: Clock, 
            text: "On Order", 
            color: "text-blue-600 bg-blue-50 border-blue-200" 
          };
        default:
          return { 
            icon: AlertCircle, 
            text: "Out of Stock", 
            color: "text-red-600 bg-red-50 border-red-200" 
          };
      }
    };

    const { icon: Icon, text, color } = getAvailabilityInfo();

    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{text}</span>
      </div>
    );
  };

  const RelatedProductCard = ({ part }: { part: Partial<Part> }) => {
    const partPrice = parseFloat(part.price || "0");
    const partDiscount = parseFloat(part.discount || "0");
    const partListPrice = partDiscount > 0 ? partPrice + partDiscount : undefined;
    const partDiscountPercent = partListPrice ? Math.round((partDiscount / partListPrice) * 100) : 0;

    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border border-gray-200 rounded-xl hover:border-yellow-400 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
      >
        {partDiscountPercent > 0 && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
              -{partDiscountPercent}% OFF
            </div>
          </div>
        )}

        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={part.images?.[0] || "/api/placeholder/300/225"}
            alt={part.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          <div className="absolute bottom-2 left-2">
            <div className="bg-white/90 backdrop-blur-sm border border-yellow-500 text-yellow-600 px-2 py-1 rounded text-xs font-bold">
              {part.brand}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-1 rounded border border-yellow-200">
                {part.partNumber}
              </span>
            </div>

            <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-yellow-600 transition-colors duration-300 mb-2">
              {part.name}
            </h3>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-lg font-black text-yellow-600">
                ${partPrice.toFixed(2)}
              </span>
              {partListPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${partListPrice.toFixed(2)}
                </span>
              )}
            </div>
            {partDiscountPercent > 0 && (
              <p className="text-xs font-bold text-yellow-600">
                Save ${partDiscount.toFixed(2)} ({partDiscountPercent}% off)
              </p>
            )}
          </div>

          <button
            onClick={() => part.id && addToQuote(part.id, 1)}
            className="w-full text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white py-2 px-3 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-yellow-500/30 flex items-center justify-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Add to Quote</span>
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-black text-white">
                <span className="text-black">CAT</span> Parts Catalog
              </h1>
              <p className="text-yellow-100 text-sm">Product Details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span className="hover:text-yellow-600 cursor-pointer">Parts</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-yellow-600 cursor-pointer">{product.category}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-yellow-600 cursor-pointer">{product.subcategory}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <motion.div
                className="aspect-[4/3] bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowImageModal(true)}
              >
                <img
                  src={product.images[selectedImage] || "/api/placeholder/600/450"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-black/50 text-white p-2 rounded-lg backdrop-blur-sm">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
              
              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex space-x-3 mt-4">
                  {product.images.map((image: string, index: number) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square w-20 rounded-lg border-2 overflow-hidden ${
                        selectedImage === index
                          ? "border-yellow-500"
                          : "border-gray-200 hover:border-yellow-300"
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

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="font-mono text-yellow-600 text-sm font-bold bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-200 mb-2 inline-block">
                    {product.partNumber}
                  </span>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {product.brand}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                        OEM
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Heart className="h-5 w-5 text-gray-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </motion.button>
                </div>
              </div>

              {/* Mock Rating */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < 4 ? "text-yellow-500 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900">4.8</span>
                  <span className="text-gray-600">(147 reviews)</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-4xl font-black text-yellow-600">
                  ${priceNumber.toFixed(2)}
                </span>
                {listPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    ${listPrice.toFixed(2)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    -{discountPercent}% OFF
                  </div>
                )}
              </div>
              {discountPercent > 0 && (
                <p className="text-lg font-bold text-yellow-600 mb-4">
                  You save ${discountNumber.toFixed(2)} ({discountPercent}% off)
                </p>
              )}
              
              <div className="text-sm text-gray-600">
                <p>Part Number: <span className="font-mono font-bold">{product.partNumber}</span></p>
                <p>Minimum Order: {product.minimumStock} unit{product.minimumStock > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Availability */}
            <AvailabilityBadge availability={availability} stockQty={stockQty} />

            {/* Key Features */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-yellow-600" />
                Key Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Weight</p>
                    <p className="text-sm text-gray-600">{product.weight} kg</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Warranty</p>
                    <p className="text-sm text-gray-600">24 months</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Wrench className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Installation</p>
                    <p className="text-sm text-gray-600">Professional recommended</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dimensions</p>
                    <p className="text-sm text-gray-600">
                      {product.dimensions.height}mm × {product.dimensions.diameter}mm
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Quote */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(product.minimumStock, quantity - 1))}
                    className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-mono font-bold text-lg min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Total: <span className="font-bold text-yellow-600">
                    ${(priceNumber * quantity).toFixed(2)}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToQuote(product.id, quantity)}
                  disabled={availability === "out-stock"}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white disabled:text-gray-500 py-3 px-4 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-yellow-500/30 flex items-center justify-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>
                    {availability === "out-stock" ? "Out of Stock" : "Add to Quote"}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Phone className="h-5 w-5" />
                  <span>Contact Sales</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-12">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "description", label: "Description", icon: FileText },
                { id: "specs", label: "Specifications", icon: Settings },
                { id: "compatibility", label: "Compatibility", icon: Wrench },
                { id: "reviews", label: "Reviews", icon: MessageCircle }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? "border-yellow-500 text-yellow-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {id === "reviews" && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {reviews.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      {product.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <h4 className="font-bold text-blue-900">Quality Assurance</h4>
                        </div>
                        <p className="text-blue-800 text-sm">
                          All parts undergo rigorous quality testing and come with comprehensive warranty coverage.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Truck className="h-5 w-5 text-green-600" />
                          <h4 className="font-bold text-green-900">Fast Shipping</h4>
                        </div>
                        <p className="text-green-800 text-sm">
                          Same-day shipping for in-stock items. Express delivery options available.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "specs" && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">{key}</span>
                        <span className="text-gray-900 font-mono">value</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-yellow-900 mb-1">Important Note</h4>
                        <p className="text-yellow-800 text-sm">
                          Always verify compatibility with your specific machine model and serial number before ordering. 
                          Contact our technical support team if you need assistance.
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
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Compatible Models</h3>
                  <p className="text-gray-600 mb-6">
                    This {product.name.toLowerCase()} is compatible with the following CAT engine models:
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                    {product.compatibleModels.map((model: string) => (
                      <div
                        key={model}
                        className="bg-yellow-100 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-center font-bold"
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
                        <span>Professional installation recommended for optimal performance</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Ensure fuel system is properly cleaned before installation</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Use genuine CAT fuel for best filtration results</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Follow torque specifications in service manual</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_: unknown, i: number) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < 4 ? "text-yellow-500 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-gray-900">4.8</span>
                        <span className="text-gray-600">({reviews.length} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                              {review.user.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-gray-900">{review.user}</h4>
                                {review.verified && (
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                    ✓ Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }, (_: unknown, i: number) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "text-yellow-500 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">{review.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <h5 className="font-bold text-gray-900 mb-2">{review.title}</h5>
                        <p className="text-gray-700 mb-4">{review.content}</p>

                        <div className="flex items-center space-x-4 text-sm">
                          <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful ({review.helpful})</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
                      Load More Reviews
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
            <button className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors">
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <RelatedProductCard key={relatedProduct.id} part={relatedProduct} />
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-3">
                Speak with our parts specialists
              </p>
              <button className="text-yellow-600 hover:text-yellow-700 font-medium">
                1-800-CAT-PARTS
              </button>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-3">
                Get technical assistance
              </p>
              <button className="text-yellow-600 hover:text-yellow-700 font-medium">
                parts@caterpillar.com
              </button>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600 text-sm mb-3">
                Installation guides & manuals
              </p>
              <button className="text-yellow-600 hover:text-yellow-700 font-medium">
                Download PDF
              </button>
            </div>
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
                src={product.images[selectedImage] || "/api/placeholder/600/450"}
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

export default ProductDetails;