import { LucideIcon } from "lucide-react";

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

export interface PartItem {
  id: string;
  partId: string;
  barcode?: string;
  location: string;
  status: 'available' | 'reserved' | 'sold' | 'damaged' | 'maintenance';
  condition: 'new' | 'used' | 'refurbished' | 'damaged';
  serialNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // Order ID if reserved/sold
}

export interface Order {
  id: string;
  customer: string;
  customerId: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  date: string;
  orderItems?: OrderItem[];
  shippingAddress?: Address;
  notes?: string;
}

export interface OrderItem {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  status: "active" | "inactive";
  address?: Address;
  createdAt?: string;
  notes?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface DashboardStats {
  totalParts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  partsLowStock: number;
  pendingOrders: number;
  dailyRevenue: number;
  monthlyGrowth: number;
}

export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "out-stock"
  | "on-order"
  | "cancelled"
  | "in-stock"
  | "low-stock"
  | "out-stock";

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  disabled?: boolean;
  loading?: boolean;
}

export interface LocationI {
  id: string;
  name: string;
  zone: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  description?: string;
}

export interface BarcodeData {
  code: string;
  type: 'CODE128' | 'CODE39' | 'EAN13' | 'QR';
  generatedAt: string;
}