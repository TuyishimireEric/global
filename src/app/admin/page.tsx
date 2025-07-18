"use client";

import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Plus,
  Upload,
  Download,
  Bell,
  Eye,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { StatCard, TableRow, ActionButton, StatusBadge, Card } from '../../components/ui';
import { mockRecentOrders, mockStats } from '@/utils/constants';


const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Parts"
          value={mockStats.totalParts.toLocaleString()}
          icon={Package}
          trend={5.2}
          color="yellow"
        />
        <StatCard
          title="Active Orders"
          value={mockStats.totalOrders}
          icon={ShoppingCart}
          trend={12.5}
          color="blue"
        />
        <StatCard
          title="Customers"
          value={mockStats.totalCustomers}
          icon={Users}
          trend={8.1}
          color="green"
        />
        <StatCard
          title="Revenue"
          value={`$${mockStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={15.3}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <ActionButton icon={Plus} label="Add New Part" />
          <ActionButton
            icon={Upload}
            label="Import Inventory"
            variant="secondary"
          />
          <ActionButton
            icon={Download}
            label="Export Reports"
            variant="secondary"
          />
          <ActionButton
            icon={Bell}
            label="Send Notifications"
            variant="secondary"
          />
        </div>
      </Card>

      {/* Recent Orders */}
      <Card padding={false}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <ActionButton icon={Eye} label="View All" variant="outline" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
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
              </tr>
            </thead>
            <tbody>
              {mockRecentOrders.map((order) => (
                <TableRow key={order.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.date}
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alerts */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">System Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Low Stock Alert</p>
              <p className="text-sm text-red-600">
                23 parts are running low on stock
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Pending Orders</p>
              <p className="text-sm text-yellow-600">
                12 orders are waiting for processing
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;