"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  ShoppingCart,
  FileText,
  Download,
  Mail,
  Phone,
  Calculator,
  Package,
  Truck,
  Clock,
  Star,
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  Info,
  User,
  Building,
  MapPin,
  Percent,
  DollarSign,
} from "lucide-react";

// Types
interface QuoteItem {
  id: string;
  partId: string;
  name: string;
  sku: string;
  manufacturer: string;
  price: number;
  listPrice?: number;
  quantity: number;
  availability: string;
  image: string;
  category: string;
  weight: string;
  leadTime: string;
}

interface Part {
  id: string;
  name: string;
  sku: string;
  manufacturer: string;
  price: number;
  listPrice?: number;
  availability: string;
  image: string;
  category: string;
  weight: string;
  leadTime: string;
  rating?: number;
  reviews?: number;
}

interface CustomerInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

// Sample data
const sampleQuoteItems: QuoteItem[] = [
  {
    id: "1",
    partId: "1",
    name: "Hydraulic Pump Assembly",
    sku: "CAT-320-HP-001",
    manufacturer: "Caterpillar",
    price: 2450.0,
    listPrice: 2800.0,
    quantity: 2,
    availability: "in-stock",
    image: "/api/placeholder/300/225",
    category: "Hydraulic System",
    weight: "45.2 kg",
    leadTime: "1-2 days",
  },
  {
    id: "2",
    partId: "2",
    name: "Engine Air Filter",
    sku: "CAT-320-AF-002",
    manufacturer: "Caterpillar",
    price: 89.99,
    listPrice: 120.0,
    quantity: 4,
    availability: "in-stock",
    image: "/api/placeholder/300/225",
    category: "Engine Components",
    weight: "2.1 kg",
    leadTime: "Same day",
  },
  {
    id: "3",
    partId: "4",
    name: "Hydraulic Cylinder Seal Kit",
    sku: "CAT-320-SK-004",
    manufacturer: "Reman Factory",
    price: 245.0,
    listPrice: 289.0,
    quantity: 1,
    availability: "in-stock",
    image: "/api/placeholder/300/225",
    category: "Hydraulic System",
    weight: "1.8 kg",
    leadTime: "1-2 days",
  },
];

const availableParts: Part[] = [
  {
    id: "5",
    name: "Engine Oil Filter",
    sku: "CAT-320-OF-005",
    manufacturer: "Caterpillar",
    price: 34.99,
    availability: "in-stock",
    image: "/api/placeholder/300/225",
    category: "Engine Components",
    weight: "1.2 kg",
    leadTime: "Same day",
    rating: 4.9,
    reviews: 234,
  },
  {
    id: "6",
    name: "Track Chain Assembly",
    sku: "CAT-320-TC-003",
    manufacturer: "Aftermarket Pro",
    price: 1850.0,
    availability: "low-stock",
    image: "/api/placeholder/300/225",
    category: "Undercarriage",
    weight: "85.5 kg",
    leadTime: "3-5 days",
    rating: 4.4,
    reviews: 23,
  },
  {
    id: "7",
    name: "Boom Cylinder",
    sku: "CAT-320-BC-006",
    manufacturer: "Caterpillar",
    price: 3250.0,
    availability: "on-order",
    image: "/api/placeholder/300/225",
    category: "Hydraulic System",
    weight: "125.0 kg",
    leadTime: "7-10 days",
    rating: 4.5,
    reviews: 67,
  },
  {
    id: "8",
    name: "Hydraulic Hose Assembly",
    sku: "CAT-320-HA-005",
    manufacturer: "Caterpillar",
    price: 156.5,
    availability: "in-stock",
    image: "/api/placeholder/300/225",
    category: "Hydraulic System",
    weight: "3.2 kg",
    leadTime: "1-2 days",
    rating: 4.6,
    reviews: 45,
  },
];

const QuotationPage: React.FC = () => {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>(sampleQuoteItems);
  const [searchResults, setSearchResults] = useState<Part[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<
    "draft" | "sent" | "confirmed"
  >("draft");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState("");

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = availableParts.filter(
        (part) =>
          part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          part.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Calculations
  const subtotal = quoteItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = subtotal * (discountPercent / 100);
  const tax = (subtotal - discount) * 0.085; // 8.5% tax
  const total = subtotal - discount + tax;
  const totalSavings = quoteItems.reduce((sum, item) => {
    const savings = item.listPrice
      ? (item.listPrice - item.price) * item.quantity
      : 0;
    return sum + savings;
  }, 0);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setQuoteItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const removeItem = (id: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addToQuote = (part: Part, quantity: number = 1) => {
    const existingItem = quoteItems.find((item) => item.partId === part.id);

    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      const newItem: QuoteItem = {
        id: Date.now().toString(),
        partId: part.id,
        name: part.name,
        sku: part.sku,
        manufacturer: part.manufacturer,
        price: part.price,
        listPrice: part.listPrice,
        quantity,
        availability: part.availability,
        image: part.image,
        category: part.category,
        weight: part.weight,
        leadTime: part.leadTime,
      };
      setQuoteItems((prev) => [...prev, newItem]);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const startEditing = (id: string, currentQuantity: number) => {
    setEditingItem(id);
    setEditQuantity(currentQuantity);
  };

  const saveEdit = () => {
    if (editingItem) {
      updateQuantity(editingItem, editQuantity);
    }
    setEditingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditQuantity(1);
  };

  const AvailabilityBadge = ({ availability }: { availability: string }) => {
    const getAvailabilityInfo = () => {
      switch (availability) {
        case "in-stock":
          return {
            text: "In Stock",
            color: "bg-green-100 text-green-700 border-green-200",
          };
        case "low-stock":
          return {
            text: "Low Stock",
            color: "bg-orange-100 text-orange-700 border-orange-200",
          };
        case "on-order":
          return {
            text: "On Order",
            color: "bg-blue-100 text-blue-700 border-blue-200",
          };
        default:
          return {
            text: "Out of Stock",
            color: "bg-red-100 text-red-700 border-red-200",
          };
      }
    };

    const { text, color } = getAvailabilityInfo();
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}
      >
        {text}
      </span>
    );
  };

  const QuoteItemCard = ({ item }: { item: QuoteItem }) => {
    const itemTotal = item.price * item.quantity;
    const itemSavings = item.listPrice
      ? (item.listPrice - item.price) * item.quantity
      : 0;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Product Image */}
          <div className="w-full lg:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-yellow-600 text-sm font-bold bg-yellow-100 px-2 py-1 rounded border border-yellow-200">
                    {item.sku}
                  </span>
                  <AvailabilityBadge availability={item.availability} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {item.manufacturer}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium">{item.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Weight:</span>
                    <p className="font-medium">{item.weight}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Lead Time:</span>
                    <p className="font-medium">{item.leadTime}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Unit Price:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-yellow-600">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.listPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.listPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end space-y-4">
                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  {editingItem === item.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={editQuantity}
                        onChange={(e) =>
                          setEditQuantity(parseInt(e.target.value) || 1)
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center font-mono"
                      />
                      <button
                        onClick={saveEdit}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => startEditing(item.id, item.quantity)}
                        className="px-4 py-2 font-mono font-bold text-lg bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                      >
                        {item.quantity}
                      </button>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Total and Actions */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    ${itemTotal.toFixed(2)}
                  </div>
                  {itemSavings > 0 && (
                    <div className="text-sm text-green-600 font-medium mb-2">
                      Save ${itemSavings.toFixed(2)}
                    </div>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const SearchResultCard = ({ part }: { part: Part }) => {
    const isInQuote = quoteItems.some((item) => item.partId === part.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-4 hover:border-yellow-400 hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={part.image}
              alt={part.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-1 rounded">
                {part.sku}
              </span>
              <AvailabilityBadge availability={part.availability} />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
              {part.name}
            </h4>
            <p className="text-xs text-gray-600 mb-2">{part.manufacturer}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-yellow-600">
                  ${part.price.toFixed(2)}
                </span>
                {part.listPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    ${part.listPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {part.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">{part.rating}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => addToQuote(part)}
            disabled={isInQuote}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              isInQuote
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
          >
            {isInQuote ? "Added" : "Add"}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-black text-white mb-1">
                  <span className="text-black">CAT</span> Parts Quotation
                </h1>
                <p className="text-yellow-100">
                  Quote #QT-{Date.now().toString().slice(-6)} •{" "}
                  {quoteItems.length} items
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  quoteStatus === "draft"
                    ? "bg-yellow-200 text-yellow-800"
                    : quoteStatus === "sent"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-green-200 text-green-800"
                }`}
              >
                {quoteStatus === "draft"
                  ? "Draft"
                  : quoteStatus === "sent"
                  ? "Sent"
                  : "Confirmed"}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Parts</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Parts Search */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Search className="h-5 w-5 mr-2 text-yellow-600" />
                        Add Parts to Quote
                      </h3>
                      <button
                        onClick={() => setShowSearch(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search by part name, SKU, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        {searchResults.map((part) => (
                          <SearchResultCard key={part.id} part={part} />
                        ))}
                      </div>
                    </div>
                  )}

                  {searchQuery && searchResults.length === 0 && (
                    <div className="p-6 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        No parts found matching your search.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quote Items */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="h-6 w-6 mr-2 text-yellow-600" />
                Quote Items ({quoteItems.length})
              </h2>

              {quoteItems.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No items in quote
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start adding parts to build your quotation
                  </p>
                  <button
                    onClick={() => setShowSearch(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    Add Parts
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {quoteItems.map((item) => (
                      <QuoteItemCard key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Notes Section */}
            {quoteItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-yellow-600" />
                  Quote Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions or notes for this quote..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none resize-none"
                />
              </div>
            )}
          </div>

          {/* Quote Summary Sidebar */}
          {quoteItems.length > 0 && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-yellow-600" />
                  Quote Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>You Save:</span>
                      <span className="font-medium">
                        -${totalSavings.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={discountPercent}
                        onChange={(e) =>
                          setDiscountPercent(parseFloat(e.target.value) || 0)
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                      <Percent className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount Amount:</span>
                      <span className="font-medium">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8.5%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total:
                      </span>
                      <span className="text-2xl font-black text-yellow-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>Save Draft</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download PDF</span>
                  </motion.button>
                </div>

                {/* Quote Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Quote valid for 30 days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $500</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>All parts include warranty</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">
                  Quote Statistics
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">Total Items</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {quoteItems.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">
                        Total Quantity
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {quoteItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">Avg. Price</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      $
                      {(
                        subtotal /
                        quoteItems.reduce((sum, item) => sum + item.quantity, 0)
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">
                        Est. Lead Time
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">3-5 days</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Information Modal */}
      <AnimatePresence>
        {showCustomerForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCustomerForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Customer Information
                </h3>
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="h-4 w-4 inline mr-2" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={customerInfo.company}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                      placeholder="ABC Construction"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={customerInfo.city}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={customerInfo.state}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                      placeholder="NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={customerInfo.zipCode}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">
                        Quote Information
                      </h4>
                      <p className="text-yellow-800 text-sm">
                        This quote will be sent to the provided email address
                        and will be valid for 30 days. You&apos;ll receive a
                        confirmation email with quote details and next steps.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setQuoteStatus("sent");
                      setShowCustomerForm(false);
                      // Here you would typically send the quote
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-yellow-500/30 flex items-center justify-center space-x-2"
                  >
                    <Send className="h-5 w-5" />
                    <span>Send Quote</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowCustomerForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {quoteStatus === "sent" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3"
          >
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-bold">Quote Sent Successfully!</p>
              <p className="text-sm opacity-90">
                Customer will receive an email confirmation
              </p>
            </div>
            <button
              onClick={() => setQuoteStatus("draft")}
              className="ml-4 hover:bg-green-600 p-1 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuotationPage;
