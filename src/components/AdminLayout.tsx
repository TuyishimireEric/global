// components/AdminLayout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  BarChart3,
  Menu,
  Bell,
  RefreshCw,
  Database,
} from "lucide-react";
import { SidebarItem } from "../types";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Fix hydration by ensuring client-only rendering for dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      id: "parts",
      label: "Parts Management",
      href: "/admin/parts",
      icon: Package,
    },
    {
      id: "orders",
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      id: "customers",
      label: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      id: "analytics",
      label: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    { id: "reports", label: "Reports", href: "/admin/reports", icon: FileText },
    {
      id: "inventory",
      label: "Inventory",
      href: "/admin/inventory",
      icon: Database,
    },
    {
      id: "settings",
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const getPageInfo = (pathname: string) => {
    if (pathname === "/admin")
      return {
        title: "Dashboard Overview",
        description:
          "Welcome back! Here's what's happening with your parts inventory.",
      };
    if (pathname.startsWith("/admin/parts"))
      return {
        title: "Parts Management",
        description: "Manage your excavator parts inventory and stock levels.",
      };
    if (pathname.startsWith("/admin/orders"))
      return {
        title: "Orders Management",
        description: "Track and manage customer orders and fulfillment.",
      };
    if (pathname.startsWith("/admin/customers"))
      return {
        title: "Customers Management",
        description: "View and manage your customer database.",
      };
    if (pathname.startsWith("/admin/analytics"))
      return {
        title: "Analytics",
        description: "Analyze sales performance and inventory trends.",
      };
    if (pathname.startsWith("/admin/reports"))
      return {
        title: "Reports",
        description: "Generate detailed reports and insights.",
      };
    if (pathname.startsWith("/admin/inventory"))
      return {
        title: "Inventory",
        description: "Monitor stock levels and manage warehouse operations.",
      };
    if (pathname.startsWith("/admin/settings"))
      return {
        title: "Settings",
        description: "Configure system settings and preferences.",
      };
    return { title: "Admin Panel", description: "CAT Parts Management System" };
  };

  const pageInfo = getPageInfo(pathname);

  const Sidebar = () => (
    <div className="bg-gradient-to-b from-yellow-500 to-yellow-600 text-white h-full">
      <div className="p-6 border-b border-yellow-400">
        <Link href="/admin" className="block">
          <h2 className="text-2xl font-black">
            <span className="text-black">CAT</span> Admin
          </h2>
          <p className="text-yellow-100 text-sm">Parts Management System</p>
        </Link>
      </div>

      <nav className="mt-6">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <motion.div key={item.id} whileHover={{ x: 4 }}>
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white border-r-4 border-white"
                    : "text-yellow-100 hover:bg-yellow-400 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {pageInfo.title}
                  </h1>
                  <p className="text-sm text-gray-600">{pageInfo.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-600">System Administrator</p>
                  </div>
                  <div className="h-8 w-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AU</span>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 px-4 py-3 lg:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>© 2024 CAT Parts Admin</span>
                <span>•</span>
                <span>Version 2.1.0</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                  <span>System Operational</span>
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <button className="hover:text-yellow-600 transition-colors">
                  Support
                </button>
                <span>•</span>
                <button className="hover:text-yellow-600 transition-colors">
                  Documentation
                </button>
                <span>•</span>
                <button className="hover:text-yellow-600 transition-colors">
                  API Status
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-64 h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>

              {/* Page Title */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {pageInfo.title}
                </h1>
                <p className="text-sm text-gray-600">{pageInfo.description}</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </motion.button>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, rotate: 180 }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </motion.button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-600">System Administrator</p>
                </div>
                <div className="h-8 w-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AU</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>© 2024 CAT Parts Admin</span>
              <span>•</span>
              <span>Version 2.1.0</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <span>System Operational</span>
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button className="hover:text-yellow-600 transition-colors">
                Support
              </button>
              <span>•</span>
              <button className="hover:text-yellow-600 transition-colors">
                Documentation
              </button>
              <span>•</span>
              <button className="hover:text-yellow-600 transition-colors">
                API Status
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;