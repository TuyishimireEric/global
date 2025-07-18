// app/admin/orders/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Eye, 
  CheckCircle, 
  Download,
  Truck,
  Clock,
  XCircle
} from 'lucide-react';
import { 
  PageHeader, 
  SearchInput, 
  ActionButton, 
  TableRow, 
  StatusBadge, 
  Card 
} from '../../../components/ui';
import { mockRecentOrders } from '@/utils/constants';

const OrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = mockRecentOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    setSelectedOrders(
      selectedOrders.length === filteredOrders.length
        ? []
        : filteredOrders.map(order => order.id)
    );
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    // Handle status update logic
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
  };

  const getOrderStats = () => {
    const total = mockRecentOrders.length;
    const pending = mockRecentOrders.filter(o => o.status === 'pending').length;
    const processing = mockRecentOrders.filter(o => o.status === 'processing').length;
    const shipped = mockRecentOrders.filter(o => o.status === 'shipped').length;
    const completed = mockRecentOrders.filter(o => o.status === 'completed').length;

    return { total, pending, processing, shipped, completed };
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders Management"
        description="Track and manage customer orders and fulfillment"
      >
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search orders..."
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ActionButton icon={Download} label="Export" variant="secondary" />
        <ActionButton icon={Plus} label="New Order" />
      </PageHeader>

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            <p className="text-sm text-gray-600">Processing</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
            <p className="text-sm text-gray-600">Shipped</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="hover:text-yellow-600 transition-colors"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link 
                      href={`/admin/customers/${order.customerId}`}
                      className="hover:text-yellow-600 transition-colors"
                    >
                      {order.customer}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/orders/${order.id}`}>
                        <button className="text-blue-600 hover:text-blue-700 p-1" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      {order.status === 'pending' && (
                        <button 
                          className="text-green-600 hover:text-green-700 p-1" 
                          title="Mark as Processing"
                          onClick={() => handleStatusUpdate(order.id, 'processing')}
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button 
                          className="text-purple-600 hover:text-purple-700 p-1" 
                          title="Mark as Shipped"
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                        >
                          <Truck className="h-4 w-4" />
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button 
                          className="text-green-600 hover:text-green-700 p-1" 
                          title="Mark as Completed"
                          onClick={() => handleStatusUpdate(order.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <button 
                          className="text-red-600 hover:text-red-700 p-1" 
                          title="Cancel Order"
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-3">
              <ActionButton 
                icon={Download} 
                label="Export Selected" 
                variant="secondary" 
              />
              <ActionButton 
                icon={Truck} 
                label="Mark as Shipped" 
                variant="secondary" 
              />
              <ActionButton 
                icon={CheckCircle} 
                label="Mark as Completed" 
                variant="secondary" 
              />
              <ActionButton 
                icon={XCircle} 
                label="Cancel Orders" 
                variant="danger" 
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrdersPage;