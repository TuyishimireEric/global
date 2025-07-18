// components/ui/index.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUp, 
  ArrowDown, 
  Loader2,
  LucideIcon 
} from 'lucide-react';
import { StatusType, ActionButtonProps } from '../../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  color?: 'yellow' | 'green' | 'red' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "yellow" 
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p
            className={`text-sm flex items-center mt-1 ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend > 0 ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            {Math.abs(trend)}%
          </p>
        )}
      </div>
      <div
        className={`p-3 rounded-xl ${
          color === "yellow"
            ? "bg-yellow-100"
            : color === "green"
            ? "bg-green-100"
            : color === "red"
            ? "bg-red-100"
            : "bg-blue-100"
        }`}
      >
        <Icon
          className={`h-6 w-6 ${
            color === "yellow"
              ? "text-yellow-600"
              : color === "green"
              ? "text-green-600"
              : color === "red"
              ? "text-red-600"
              : "text-blue-600"
          }`}
        />
      </div>
    </div>
  </motion.div>
);

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  onSelect?: () => void;
}

export const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  onClick, 
  selected = false, 
  onSelect 
}) => (
  <motion.tr
    whileHover={{ backgroundColor: "#f9fafb" }}
    onClick={onClick}
    className={`border-b border-gray-200 cursor-pointer transition-colors ${
      selected ? "bg-yellow-50" : ""
    }`}
  >
    {onSelect && (
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
          onClick={(e) => e.stopPropagation()}
        />
      </td>
    )}
    {children}
  </motion.tr>
);

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
}) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    onClick={onClick}
    disabled={disabled || loading}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
      variant === "primary"
        ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg"
        : variant === "secondary"
        ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
        : variant === "danger"
        ? "bg-red-500 hover:bg-red-600 text-white"
        : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
    }`}
  >
    {loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Icon className="h-4 w-4" />
    )}
    <span>{label}</span>
  </motion.button>
);

interface StatusBadgeProps {
  status: StatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: StatusType): string => {
    switch (status) {
      case "active":
      case "completed":
      case "in-stock":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
      case "low-stock":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "inactive":
      case "cancelled":
      case "out-stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
        status
      )}`}
    >
      {status.replace("-", " ").toUpperCase()}
    </span>
  );
};

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {description && (
        <p className="text-gray-600 mt-1">{description}</p>
      )}
    </div>
    {children && (
      <div className="flex items-center space-x-3">
        {children}
      </div>
    )}
  </div>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = "", 
  padding = true 
}) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${padding ? 'p-6' : ''} ${className}`}>
    {children}
  </div>
);

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
    />
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>
);