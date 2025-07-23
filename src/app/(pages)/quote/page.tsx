"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
  Loader2,
  AlertCircle,
  LogIn,
  UserCheck,
  Crown,
  Receipt,
} from "lucide-react";
import useClientParts from "@/hooks/parts/useParts";
import { TransformedPart } from "@/types/parts";
import Link from "next/link";
import { useClientSession } from "@/hooks/user/useClientSession";

// Types matching your backend schema
interface QuotationItem {
  partId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  notes?: string;
}

interface CreateQuotationData {
  quotation: {
    quotationNumber?: string;
    companyId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    shippingAmount: number;
    totalAmount: number;
    validUntil?: string;
    paymentTerms?: string;
    notes?: string;
    internalNotes?: string;
    status?: "draft" | "pending" | "confirmed";
  };
  items: QuotationItem[];
}

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
  images: string;
  category: string;
  discount: number;
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

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "seller" | "customer" | "admin";
  company?: string;
}

// API functions
const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await fetch("/api/auth/profile");
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

const getClients = async (): Promise<Client[]> => {
  const response = await fetch("/api/clients");
  if (!response.ok) throw new Error("Failed to fetch clients");
  return response.json();
};

const createQuotation = async (data: CreateQuotationData) => {
  const response = await fetch("/api/quotations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create quotation");
  }

  return response.json();
};

const saveQuotationDraft = async (data: CreateQuotationData) => {
  const response = await fetch("/api/quotations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      quotation: {
        ...data.quotation,
        status: "draft",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save draft");
  }

  return response.json();
};

const confirmQuotation = async (quotationId: string) => {
  const response = await fetch(`/api/quotations/${quotationId}/confirm`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to confirm quotation");
  }

  return response.json();
};

const convertToInvoice = async (quotationId: string) => {
  const response = await fetch(
    `/api/quotations/${quotationId}/convert-to-invoice`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to convert to invoice");
  }

  return response.json();
};

const QuotationPage: React.FC = () => {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [validUntilDays, setValidUntilDays] = useState(30);
  const [shippingAmount, setShippingAmount] = useState(0);
  const [quotationId, setQuotationId] = useState<string | null>(null);

  const { userRole } = useClientSession()

  // Backend query parameters
  const backendParams = useMemo(
    () => ({
      page: 1,
      limit: 20,
      searchText: searchQuery || undefined,
      isActive: true,
    }),
    [searchQuery]
  );

  const { parts, totalCount, isLoading, refetch } =
    useClientParts(backendParams);

  // Clients query (only for sellers)
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
    enabled: userRole === "Seller",
    retry: false,
  });

  const queryClient = useQueryClient();

  // Mutations
  const createQuotationMutation = useMutation({
    mutationFn: createQuotation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      setQuotationId(data.id);
      console.log("Quotation created successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error creating quotation:", error);
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: saveQuotationDraft,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      setQuotationId(data.id);
      console.log("Draft saved successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error saving draft:", error);
    },
  });

  const confirmQuotationMutation = useMutation({
    mutationFn: confirmQuotation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      console.log("Quotation confirmed successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error confirming quotation:", error);
    },
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: convertToInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotations", "invoices"] });
      console.log("Converted to invoice successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error converting to invoice:", error);
    },
  });

  // Calculations
  const subtotal = quoteItems.reduce(
    (sum, item) => sum + item.price * item.quantity * (1 - item.discount / 100),
    0
  );
  const discountAmount = subtotal * (discountPercent / 100);
  const taxAmount = (subtotal - discountAmount + shippingAmount) * 0.085; // 8.5% tax
  const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;
  const totalSavings = quoteItems.reduce((sum, item) => {
    const unitSavings = item.listPrice ? item.listPrice - item.price : 0;
    const discountSavings = item.price * (item.discount / 100);
    return sum + (unitSavings + discountSavings) * item.quantity;
  }, 0);

  // Helper functions
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setQuoteItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
                totalPrice: item.price * quantity * (1 - item.discount / 100),
              }
            : item
        )
      );
    }
  };

  const updateItemDiscount = (id: string, discount: number) => {
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              discount,
              totalPrice: item.price * item.quantity * (1 - discount / 100),
            }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addToQuote = (part: TransformedPart, quantity: number = 1) => {
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
        price: Number(part.price),
        quantity,
        availability: part.availability,
        images: part.images[0],
        category: part.category,
        discount: 0,
      };
      setQuoteItems((prev) => [...prev, newItem]);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const prepareQuotationData = (
    status: "draft" | "pending" | "confirmed" = "draft"
  ): CreateQuotationData => {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validUntilDays);

    // Use selected client info for sellers, or customer form info for others
    const customerData =
      userRole === "Seller" && selectedClient
        ? {
            customerName: selectedClient.name,
            customerEmail: selectedClient.email,
            customerPhone: selectedClient.phone,
            customerAddress: selectedClient.address,
            companyId: selectedClient.id,
          }
        : {
            customerName: customerInfo.name || undefined,
            customerEmail: customerInfo.email || undefined,
            customerPhone: customerInfo.phone || undefined,
            customerAddress:
              `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`.trim() ||
              undefined,
          };

    return {
      quotation: {
        ...customerData,
        subtotal,
        taxAmount,
        discountAmount,
        shippingAmount,
        totalAmount,
        validUntil: validUntil.toISOString(),
        paymentTerms,
        notes: notes || undefined,
        status,
      },
      items: quoteItems.map((item) => ({
        partId: item.partId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount,
        totalPrice: item.price * item.quantity * (1 - item.discount / 100),
        notes: undefined,
      })),
    };
  };

  const handleSaveDraft = () => {
    if (!userRole) {
      setShowLoginPrompt(true);
      return;
    }

    const data = prepareQuotationData("draft");
    saveDraftMutation.mutate(data);
  };

  const handleSendQuote = () => {
    if (!userRole) {
      setShowLoginPrompt(true);
      return;
    }

    // Check if we have customer information
    const hasCustomerInfo =
      userRole === "Seller"
        ? selectedClient
        : customerInfo.email && customerInfo.name;

    if (!hasCustomerInfo) {
      if (userRole === "Seller") {
        // Show client selection for sellers
        return;
      } else {
        setShowCustomerForm(true);
        return;
      }
    }

    const status = userRole === "Seller" ? "confirmed" : "pending";
    const data = prepareQuotationData(status);
    createQuotationMutation.mutate(data);
  };

  const handleConfirmQuotation = () => {
    if (quotationId) {
      confirmQuotationMutation.mutate(quotationId);
    }
  };

  const handleConvertToInvoice = () => {
    if (quotationId) {
      convertToInvoiceMutation.mutate(quotationId);
    }
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
    const itemSubtotal = item.price * item.quantity;
    const itemDiscount = itemSubtotal * (item.discount / 100);
    const itemTotal = itemSubtotal - itemDiscount;
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
              src={item.images}
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

                {/* Item Discount - Only for sellers */}
                {userRole === "Seller" && (
                  <div className="mt-3 flex items-center space-x-3">
                    <label className="text-sm text-gray-600">
                      Item Discount:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={item.discount}
                        onChange={(e) =>
                          updateItemDiscount(
                            item.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                      <Percent className="h-4 w-4 text-gray-400" />
                      {item.discount > 0 && (
                        <span className="text-sm text-green-600 font-medium">
                          (-${itemDiscount.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
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
                        onClick={() => {
                          updateQuantity(item.id, editQuantity);
                          setEditingItem(null);
                        }}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
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
                        onClick={() => {
                          setEditingItem(item.id);
                          setEditQuantity(item.quantity);
                        }}
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
                  {(itemSavings > 0 || item.discount > 0) && (
                    <div className="text-sm text-green-600 font-medium mb-2">
                      Save ${(itemSavings + itemDiscount).toFixed(2)}
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

  const ClientSelector = () => {
    if (userRole !== "Seller") return null;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <UserCheck className="h-5 w-5 mr-2 text-yellow-600" />
          Select Client
        </h3>

        {isLoadingClients ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading clients...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={selectedClient?.id || ""}
              onChange={(e) => {
                const client = clients.find((c) => c.id === e.target.value);
                setSelectedClient(client || null);
              }}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}{" "}
                  {client.company && `(${client.company})`}
                </option>
              ))}
            </select>

            {selectedClient && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Name:</strong> {selectedClient.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedClient.email}
                  </p>
                  {selectedClient.phone && (
                    <p>
                      <strong>Phone:</strong> {selectedClient.phone}
                    </p>
                  )}
                  {selectedClient.company && (
                    <p>
                      <strong>Company:</strong> {selectedClient.company}
                    </p>
                  )}
                  {selectedClient.address && (
                    <p>
                      <strong>Address:</strong> {selectedClient.address}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
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
                <div className="flex items-center space-x-4 text-yellow-100">
                  <span>
                    Quote #QT-{Date.now().toString().slice(-6)} •{" "}
                    {quoteItems.length} items
                  </span>
                  {userRole && (
                    <div className="flex items-center space-x-2">
                      {userRole === "Seller" && (
                        <Crown className="h-4 w-4" />
                      )}
                      <span className="text-sm bg-white/20 px-2 py-1 rounded capitalize">
                        {userRole}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!userRole && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLoginPrompt(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center space-x-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </motion.button>
              )}

              {(createQuotationMutation.status === "success" ||
                saveDraftMutation.status === "success") && (
                <div className="px-4 py-2 rounded-lg text-sm font-bold bg-green-200 text-green-800">
                  {createQuotationMutation.status === "success"
                    ? "Sent"
                    : "Saved"}
                </div>
              )}

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
            {/* Client Selector for Sellers */}
            <ClientSelector />

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

                  {parts?.length > 0 && (
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        {parts?.map((part) => (
                          <div
                            key={part.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-yellow-400 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={part.images[0]}
                                  alt={part.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-1 rounded">
                                    {part.sku}
                                  </span>
                                  <AvailabilityBadge
                                    availability={part.availability}
                                  />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                                  {part.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  {part.manufacturer}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-yellow-600">
                                      ${Number(part.price).toFixed(2)}
                                    </span>
                                  </div>

                                  {part.rating && (
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                      <span className="text-xs text-gray-600">
                                        {part.rating}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => addToQuote(part)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
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

            {/* Quote Settings */}
            {quoteItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Terms */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Payment Terms
                  </h3>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    disabled={userRole !== "Seller"}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none disabled:bg-gray-100"
                  >
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                    <option value="COD">Cash on Delivery</option>
                    <option value="Prepaid">Prepaid</option>
                  </select>
                </div>

                {/* Quote Validity */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Quote Valid For
                  </h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={validUntilDays}
                      onChange={(e) =>
                        setValidUntilDays(parseInt(e.target.value) || 30)
                      }
                      disabled={userRole !== "Seller"}
                      className="w-20 border border-gray-300 rounded-lg p-3 text-center focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none disabled:bg-gray-100"
                    />
                    <span className="text-gray-600">days</span>
                  </div>
                </div>
              </div>
            )}

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
                      <span>Item Savings:</span>
                      <span className="font-medium">
                        -${totalSavings.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Quote Discount - Only for sellers */}
                  {userRole === "Seller" && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quote Discount:</span>
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
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount Amount:</span>
                      <span className="font-medium">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Shipping - Only for sellers */}
                  {userRole === "Seller" && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Shipping:</span>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingAmount}
                          onChange={(e) =>
                            setShippingAmount(parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8.5%):</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total:
                      </span>
                      <span className="text-2xl font-black text-yellow-600">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Messages */}
                {(createQuotationMutation.error ||
                  saveDraftMutation.error ||
                  confirmQuotationMutation.error ||
                  convertToInvoiceMutation.error) && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">
                        {createQuotationMutation.error?.message ||
                          saveDraftMutation.error?.message ||
                          confirmQuotationMutation.error?.message ||
                          convertToInvoiceMutation.error?.message}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Save Draft Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveDraft}
                    disabled={saveDraftMutation.isPending}
                    className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saveDraftMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span>
                      {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
                    </span>
                  </motion.button>

                  {/* Download PDF Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download PDF</span>
                  </motion.button>

                  {/* Send Quote Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendQuote}
                    disabled={
                      createQuotationMutation.isPending ||
                      (userRole === "Seller" && !selectedClient)
                    }
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-yellow-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createQuotationMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    <span>
                      {createQuotationMutation.isPending
                        ? "Sending..."
                        : userRole === "Seller"
                        ? "Confirm & Send Quote"
                        : "Send Quote"}
                    </span>
                  </motion.button>

                  {/* Convert to Invoice Button - Only for sellers with confirmed quotes */}
                  {userRole === "Seller" &&
                    quotationId &&
                    createQuotationMutation.status === "success" && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConvertToInvoice}
                        disabled={convertToInvoiceMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-green-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {convertToInvoiceMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Receipt className="h-5 w-5" />
                        )}
                        <span>
                          {convertToInvoiceMutation.isPending
                            ? "Converting..."
                            : "Convert to Invoice"}
                        </span>
                      </motion.button>
                    )}
                </div>

                {/* Quote Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Quote valid for {validUntilDays} days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $500</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>All parts include warranty</span>
                  </div>
                  {userRole === "Seller" && (
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span>Seller privileges enabled</span>
                    </div>
                  )}
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

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <LogIn className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Login Required
                </h3>
                <p className="text-gray-600 mb-6">
                  You need to be logged in to save quotations and access
                  advanced features.
                </p>
                <div className="space-y-3">
                  <Link
                    href={"/login"}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300"
                  >
                    Login
                  </Link>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
                  >
                    Continue without saving
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = prepareQuotationData("pending");
                  createQuotationMutation.mutate(data);
                  setShowCustomerForm(false);
                }}
                className="space-y-6"
              >
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
                        and will be valid for {validUntilDays} days. You'll
                        receive a confirmation email with quote details and next
                        steps.
                      </p>
                    </div>
                  </div>
                </div>

                {createQuotationMutation.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 text-sm">
                        {createQuotationMutation.error.message}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={createQuotationMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-yellow-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createQuotationMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    <span>
                      {createQuotationMutation.isPending
                        ? "Sending..."
                        : "Send Quote"}
                    </span>
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

      {/* Success Messages */}
      <AnimatePresence>
        {createQuotationMutation.status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3"
          >
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-bold">
                {userRole === "Seller"
                  ? "Quote Confirmed & Sent!"
                  : "Quote Sent Successfully!"}
              </p>
              <p className="text-sm opacity-90">
                {userRole === "Seller"
                  ? "Quote is now confirmed and ready for invoicing"
                  : "Customer will receive an email confirmation"}
              </p>
            </div>
            <button
              onClick={() => createQuotationMutation.reset()}
              className="ml-4 hover:bg-green-600 p-1 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draft Saved Message */}
      <AnimatePresence>
        {saveDraftMutation.status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3"
          >
            <Save className="h-5 w-5" />
            <div>
              <p className="font-bold">Draft Saved!</p>
              <p className="text-sm opacity-90">
                You can continue editing later
              </p>
            </div>
            <button
              onClick={() => saveDraftMutation.reset()}
              className="ml-4 hover:bg-blue-600 p-1 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Convert to Invoice Success Message */}
      <AnimatePresence>
        {convertToInvoiceMutation.status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3"
          >
            <Receipt className="h-5 w-5" />
            <div>
              <p className="font-bold">Converted to Invoice!</p>
              <p className="text-sm opacity-90">
                Quote has been successfully converted to an invoice
              </p>
            </div>
            <button
              onClick={() => convertToInvoiceMutation.reset()}
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
