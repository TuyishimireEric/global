"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Grid3X3,
  LayoutList,
  Zap,
  Star,
  Package,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Truck,
  Award,
  Settings,
  LucideIcon,
} from "lucide-react";
import { Part } from "@/types";
import { sampleParts } from "@/utils/constants";
import { PartCard } from "@/components/parts/PartCard";

interface QuoteItem {
  partId: string;
  quantity: number;
}

const PartsListing: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    category: [] as string[],
    manufacturer: [] as string[],
    availability: [] as string[],
    priceRange: [0, 5000] as [number, number],
    rating: 0,
    featured: false,
    inStock: false,
  });
  const [sortBy, setSortBy] = useState("relevance");
  const quoteItems = useState<QuoteItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    manufacturer: true,
    availability: true,
    price: true,
    rating: true,
    features: true,
  });

  const itemsPerPage = 12;

  useEffect(() => {
    setParts(sampleParts);
    setFilteredParts(sampleParts);
  }, []);

  // Enhanced filtering logic
  useEffect(() => {
    const filtered = parts.filter((part) => {
      const matchesSearch =
        !searchQuery ||
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.compatibility.some((model) =>
          model.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedFilters.category.length === 0 ||
        selectedFilters.category.includes(part.category);

      const matchesManufacturer =
        selectedFilters.manufacturer.length === 0 ||
        selectedFilters.manufacturer.includes(part.manufacturer);

      const matchesAvailability =
        selectedFilters.availability.length === 0 ||
        selectedFilters.availability.includes(part.availability);

      const matchesPrice =
        part.price >= selectedFilters.priceRange[0] &&
        part.price <= selectedFilters.priceRange[1];

      const matchesRating =
        selectedFilters.rating === 0 ||
        (part.rating && part.rating >= selectedFilters.rating);

      const matchesFeatured = !selectedFilters.featured || part.featured;

      const matchesInStock =
        !selectedFilters.inStock || part.availability === "in-stock";

      return (
        matchesSearch &&
        matchesCategory &&
        matchesManufacturer &&
        matchesAvailability &&
        matchesPrice &&
        matchesRating &&
        matchesFeatured &&
        matchesInStock
      );
    });

    // Enhanced sorting
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "stock":
        filtered.sort((a, b) => b.stockQty - a.stockQty);
        break;
      case "discount":
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        filtered.sort((a, b) => {
          const aScore =
            (a.availability === "in-stock" ? 100 : 0) +
            (a.discount || 0) +
            (a.featured ? 50 : 0);
          const bScore =
            (b.availability === "in-stock" ? 100 : 0) +
            (b.discount || 0) +
            (b.featured ? 50 : 0);
          return bScore - aScore;
        });
    }

    setFilteredParts(filtered);
    setCurrentPage(1);
  }, [parts, searchQuery, selectedFilters, sortBy]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (
    filterType: keyof typeof selectedFilters,
    value: number[]
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const toggleArrayFilter = (
    filterType: "category" | "manufacturer" | "availability",
    value: string
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      category: [],
      manufacturer: [],
      availability: [],
      priceRange: [0, 5000],
      rating: 0,
      featured: false,
      inStock: false,
    });
    setSearchQuery("");
  };

  const getActiveFilterCount = () => {
    return (
      selectedFilters.category.length +
      selectedFilters.manufacturer.length +
      selectedFilters.availability.length +
      (selectedFilters.rating > 0 ? 1 : 0) +
      (selectedFilters.featured ? 1 : 0) +
      (selectedFilters.inStock ? 1 : 0) +
      (selectedFilters.priceRange[0] > 0 || selectedFilters.priceRange[1] < 5000
        ? 1
        : 0)
    );
  };

  const FilterSection = ({
    title,
    icon: Icon,
    section,
    children,
  }: {
    title: string;
    icon: LucideIcon;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 pb-3 mb-3 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full py-1.5 text-left hover:text-yellow-600 transition-colors"
      >
        <div className="flex items-center space-x-1.5">
          <Icon className="h-3.5 w-3.5" />
          <span className="font-medium text-gray-800 text-sm">{title}</span>
        </div>
        {expandedSections[section] ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="mt-2 space-y-1.5">{children}</div>
      )}
    </div>
  );

  const Sidebar = () => {
    const categories = [...new Set(parts.map((part) => part.category))];
    const manufacturers = [...new Set(parts.map((part) => part.manufacturer))];
    const availabilityOptions = [
      {
        value: "in-stock",
        label: "In Stock",
        count: parts.filter((p) => p.availability === "in-stock").length,
      },
      {
        value: "low-stock",
        label: "Low Stock",
        count: parts.filter((p) => p.availability === "low-stock").length,
      },
      {
        value: "on-order",
        label: "On Order",
        count: parts.filter((p) => p.availability === "on-order").length,
      },
      {
        value: "out-stock",
        label: "Out of Stock",
        count: parts.filter((p) => p.availability === "out-stock").length,
      },
    ];

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-6 h-fit">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-200 focus:outline-none transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-yellow-600" />
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </h3>
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Category Filter */}
        <FilterSection title="Category" icon={Settings} section="category">
          {categories.map((category) => {
            const count = parts.filter((p) => p.category === category).length;
            return (
              <label
                key={category}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFilters.category.includes(category)}
                    onChange={() => toggleArrayFilter("category", category)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 focus:ring-offset-0 mr-2 h-3.5 w-3.5"
                  />
                  <span className="text-xs text-gray-700">{category}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              </label>
            );
          })}
        </FilterSection>

        {/* Manufacturer Filter */}
        <FilterSection title="Manufacturer" icon={Award} section="manufacturer">
          {manufacturers.map((manufacturer) => {
            const count = parts.filter(
              (p) => p.manufacturer === manufacturer
            ).length;
            return (
              <label
                key={manufacturer}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFilters.manufacturer.includes(
                      manufacturer
                    )}
                    onChange={() =>
                      toggleArrayFilter("manufacturer", manufacturer)
                    }
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 focus:ring-offset-0 mr-2 h-3.5 w-3.5"
                  />
                  <span className="text-xs text-gray-700">{manufacturer}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              </label>
            );
          })}
        </FilterSection>

        {/* Availability Filter */}
        <FilterSection title="Availability" icon={Truck} section="availability">
          {availabilityOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.availability.includes(option.value)}
                  onChange={() =>
                    toggleArrayFilter("availability", option.value)
                  }
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 focus:ring-offset-0 mr-2 h-3.5 w-3.5"
                />
                <span className="text-xs text-gray-700">{option.label}</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {option.count}
              </span>
            </label>
          ))}
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection title="Price Range" icon={DollarSign} section="price">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>${selectedFilters.priceRange[0]}</span>
              <span>${selectedFilters.priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={selectedFilters.priceRange[1]}
              onChange={(e) =>
                handleFilterChange("priceRange", [
                  selectedFilters.priceRange[0],
                  parseInt(e.target.value),
                ])
              }
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={selectedFilters.priceRange[0]}
                onChange={(e) =>
                  handleFilterChange("priceRange", [
                    parseInt(e.target.value) || 0,
                    selectedFilters.priceRange[1],
                  ])
                }
                className="px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={selectedFilters.priceRange[1]}
                onChange={(e) =>
                  handleFilterChange("priceRange", [
                    selectedFilters.priceRange[0],
                    parseInt(e.target.value) || 5000,
                  ])
                }
                className="px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>
        </FilterSection>

        {/* Rating Filter */}
        <FilterSection title="Minimum Rating" icon={Star} section="rating">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors"
            >
              <input
                type="radio"
                name="rating"
                checked={selectedFilters.rating === rating}
                onChange={() => handleFilterChange("rating", [rating])}
                className="mr-2 text-yellow-600 focus:ring-yellow-500 h-3.5 w-3.5"
              />
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < rating
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-1.5 text-xs text-gray-600">& up</span>
              </div>
            </label>
          ))}
        </FilterSection>

        {/* Features Filter */}
        <FilterSection title="Features" icon={Zap} section="features">
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors">
            <input
              type="checkbox"
              checked={selectedFilters.featured}
              // onChange={(e) => handleFilterChange("featured", e.target.checked)}
              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 focus:ring-offset-0 mr-2 h-3.5 w-3.5"
            />
            <span className="text-xs text-gray-700">Featured Items</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors">
            <input
              type="checkbox"
              checked={selectedFilters.inStock}
              // onChange={(e) => handleFilterChange("inStock", e.target.checked)}
              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 focus:ring-offset-0 mr-2 h-3.5 w-3.5"
            />
            <span className="text-xs text-gray-700">In Stock Only</span>
          </label>
        </FilterSection>
      </div>
    );
  };

  const currentParts = filteredParts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
  const quoteTotal = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                <span className="text-black">CAT</span> Parts Catalog
              </h1>
              <p className="text-yellow-100">
                Professional grade excavator components
              </p>
            </div>

            {/* Quote Summary */}
            {quoteItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/90 border border-yellow-300 rounded-xl p-4 backdrop-blur-sm shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">Quote Progress</p>
                    <p className="text-sm text-gray-600">
                      {quoteItems.length} items • ${quoteTotal.toFixed(2)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    View Quote
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileFilters(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-lg flex items-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              {getActiveFilterCount() > 0 && (
                <span className="bg-white text-yellow-600 text-sm font-bold px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </motion.button>
          </div>

          {/* Mobile Filter Overlay */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowMobileFilters(false)}
              >
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="w-64 h-full bg-white overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-1.5 hover:bg-gray-100 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <Sidebar />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  <strong className="text-yellow-600">
                    {filteredParts.length}
                  </strong>{" "}
                  parts found
                </span>

                {/* Active Filters Display */}
                {getActiveFilterCount() > 0 && (
                  <div className="hidden sm:flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedFilters.category.map((category) => (
                        <span
                          key={category}
                          className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center"
                        >
                          {category}
                          <button
                            onClick={() =>
                              toggleArrayFilter("category", category)
                            }
                            className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {selectedFilters.manufacturer.map((manufacturer) => (
                        <span
                          key={manufacturer}
                          className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center"
                        >
                          {manufacturer}
                          <button
                            onClick={() =>
                              toggleArrayFilter("manufacturer", manufacturer)
                            }
                            className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-yellow-500 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-yellow-500 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <label className="text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                >
                  <option value="relevance">Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="stock">Stock Level</option>
                  <option value="discount">Best Savings</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Parts Grid */}
            <div
              className={`grid gap-6 mb-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              <AnimatePresence>
                {currentParts.map((part) => (
                  <PartCard key={part.id} part={part} />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300 shadow-sm"
                >
                  Previous
                </motion.button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                        currentPage === page
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                      }`}
                    >
                      {page}
                    </motion.button>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300 shadow-sm"
                >
                  Next
                </motion.button>
              </div>
            )}

            {/* No Results */}
            {filteredParts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md mx-auto shadow-sm">
                  <Package className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No Parts Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-md hover:shadow-yellow-500/30 transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartsListing;
