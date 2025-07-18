"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Minus,
  Share2,
  FileText,
  Zap,
  Star,
  Wrench,
  ChevronRight,
  Eye,
  Heart,
} from "lucide-react";
import { Part } from "@/types";

export const PartCard = ({ part }: { part: Part }) => {
  const addToQuote = (partId: string, quantity: number = 1) => {
   console.log(partId, quantity)
  };

  const updateQuoteQuantity = (partId: string, quantity: number) => {
    console.log(partId, quantity)
  };

  const getQuoteQuantity = (partId: string) => {
    console.log(partId)
    return 0;
  };
  const quoteQty = getQuoteQuantity(part.id);
  const savings = part.listPrice ? part.listPrice - part.price : 0;
  const savingsPercent = part.listPrice
    ? Math.round((savings / part.listPrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl hover:border-yellow-400 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
    >
      {/* Featured Badge */}
      {part.featured && (
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide shadow-lg">
            <Zap className="h-3 w-3 inline mr-1" />
            Featured
          </div>
        </div>
      )}

      {/* Discount Badge */}
      {part.discount && (
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
            -{part.discount}% OFF
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={part.image}
          alt={part.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-yellow-500 hover:bg-yellow-400 text-white p-3 rounded-full shadow-lg"
          >
            <Eye className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full shadow-lg"
          >
            <Heart className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full shadow-lg"
          >
            <Share2 className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Manufacturer Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm border border-yellow-500 text-yellow-600 px-2 py-1 rounded text-xs font-bold">
            {part.manufacturer}
          </div>
        </div>
      </div>

      <div className="p-5 relative z-10">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-yellow-600 text-[8px] font-bold bg-yellow-100 px-2 py-1 rounded border border-yellow-200">
              {part.sku}
            </span>
            {part.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-yellow-600 font-medium text-sm">
                  {part.rating}
                </span>
                <span className="text-gray-500 text-xs">({part.reviews})</span>
              </div>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-yellow-600 transition-colors duration-300 mb-1">
            {part.name}
          </h3>
        </div>

        {/* Compatibility */}
        <div className="mb-4">
          <p className="text-gray-600 text-xs mb-2 flex items-center">
            <Wrench className="h-3 w-3 mr-1" />
            Compatible Models:
          </p>
          <div className="flex flex-wrap gap-1">
            {part.compatibility.slice(0, 4).map((model) => (
              <span
                key={model}
                className="text-xs bg-yellow-100 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded font-medium"
              >
                {model}
              </span>
            ))}
            {part.compatibility.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{part.compatibility.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-5">
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="text-lg font-black text-yellow-600">
              ${part.price.toFixed(2)}
            </span>
            {part.listPrice && (
              <span className="text-lg text-gray-500 line-through">
                ${part.listPrice.toFixed(2)}
              </span>
            )}
          </div>
          {savingsPercent > 0 && (
            <p className="text-sm font-bold text-yellow-600">
              Save ${savings.toFixed(2)} ({savingsPercent}% off)
            </p>
          )}
        </div>

        {/* Quote Actions */}
        <div className="space-y-3">
          {quoteQty > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-yellow-700">
                  In Quote: {quoteQty}
                </span>
                <span className="text-xs text-gray-600">
                  ${(part.price * quoteQty).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => updateQuoteQuantity(part.id, quoteQty - 1)}
                  className="w-10 h-6  bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded-lg flex items-center justify-center text-yellow-700 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-mono text-yellow-700 font-bold text-lg mx-4">
                  {quoteQty}
                </span>
                <button
                  onClick={() => updateQuoteQuantity(part.id, quoteQty + 1)}
                  className="w-10 h-6 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded-lg flex items-center justify-center text-yellow-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToQuote(part.id, part.minOrder)}
              disabled={part.availability === "out-stock"}
              className="w-full text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white disabled:text-gray-500 py-2 px-4 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-yellow-500/30 flex items-center justify-center space-x-2"
            >
              <FileText className="h-5 w-5" />
              <span>
                {part.availability === "out-stock"
                  ? "Out of Stock"
                  : "Add to Quote"}
              </span>
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
