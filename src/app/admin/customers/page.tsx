// app/admin/customers/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Mail, 
  Eye,
  Download,
  Phone,
} from 'lucide-react';
import { 
  PageHeader, 
  SearchInput, 
  ActionButton, 
  TableRow, 
  StatusBadge, 
  Card 
} from '../../../components/ui';
import { mockCustomers } from '@/utils/constants';

const CustomersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const statusOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCustomers(
      selectedCustomers.length === filteredCustomers.length
        ? []
        : filteredCustomers.map(customer => customer.id)
    );
  };

  const getCustomerStats = () => {
    const total = mockCustomers.length;
    const active = mockCustomers.filter(c => c.status === 'active').length;
    const inactive = mockCustomers.filter(c => c.status === 'inactive').length;
    const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.spent, 0);
    const avgOrderValue = totalRevenue / mockCustomers.reduce((sum, c) => sum + c.orders, 0);

    return { total, active, inactive, totalRevenue, avgOrderValue };
  };

  const stats = getCustomerStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers Management"
        description="View and manage your customer database"
      >
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search customers..."
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
        <ActionButton icon={Plus} label="Add Customer" />
      </PageHeader>

      {/* Customer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Customers</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            <p className="text-sm text-gray-600">Inactive</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">${stats.avgOrderValue.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Avg Order Value</p>
          </div>
        </Card>
      </div>

      {/* Customers Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === filteredCustomers.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <Link 
                        href={`/admin/customers/${customer.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-yellow-600 transition-colors"
                      >
                        {customer.name}
                      </Link>
                      <p className="text-xs text-gray-500">ID: {customer.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <a 
                          href={`mailto:${customer.email}`}
                          className="hover:text-yellow-600 transition-colors"
                        >
                          {customer.email}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <a 
                          href={`tel:${customer.phone}`}
                          className="hover:text-yellow-600 transition-colors"
                        >
                          {customer.phone}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link 
                      href={`/admin/customers/${customer.id}/orders`}
                      className="hover:text-yellow-600 transition-colors font-medium"
                    >
                      {customer.orders}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="font-medium">${customer.spent.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/customers/${customer.id}`}>
                        <button className="text-blue-600 hover:text-blue-700 p-1" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/customers/${customer.id}/edit`}>
                        <button className="text-green-600 hover:text-green-700 p-1" title="Edit Customer">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <a href={`mailto:${customer.email}`}>
                        <button className="text-purple-600 hover:text-purple-700 p-1" title="Send Email">
                          <Mail className="h-4 w-4" />
                        </button>
                      </a>
                    </div>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-3">
              <ActionButton 
                icon={Download} 
                label="Export Selected" 
                variant="secondary" 
              />
              <ActionButton 
                icon={Mail} 
                label="Send Email" 
                variant="secondary" 
              />
              <ActionButton 
                icon={Edit} 
                label="Bulk Edit" 
                variant="secondary" 
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomersPage;