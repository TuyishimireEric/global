// app/admin/parts/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
} from "lucide-react";
import {
  PageHeader,
  SearchInput,
  ActionButton,
  TableRow,
  StatusBadge,
  Card,
} from "../../../components/ui";
import { sampleParts } from "@/utils/constants";

const PartsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  const filteredParts = sampleParts.filter(
    (part) =>
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPart = (partId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId]
    );
  };

  const handleSelectAll = () => {
    setSelectedParts(
      selectedParts.length === filteredParts.length
        ? []
        : filteredParts.map((part) => part.id)
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parts Management"
        description="Manage your excavator parts inventory and stock levels"
      >
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search parts..."
          className="w-64"
        />
        <ActionButton icon={Filter} label="Filter" variant="outline" />
        <ActionButton icon={Upload} label="Import" variant="secondary" />
        <ActionButton icon={Download} label="Export" variant="secondary" />
        <Link href="/admin/parts/create">
          <ActionButton icon={Plus} label="Add Part" />
        </Link>
      </PageHeader>

      {/* Parts Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedParts.length === filteredParts.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
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
              {filteredParts.map((part) => (
                <TableRow key={part.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedParts.includes(part.id)}
                      onChange={() => handleSelectPart(part.id)}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <Link
                      href={`/admin/parts/${part.id}`}
                      className="hover:text-yellow-600 transition-colors"
                    >
                      {part.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {part.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {part.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span
                      className={`font-medium ${
                        part.stockQty <= 5
                          ? "text-red-600"
                          : part.stockQty <= 10
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {part.stockQty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${part.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={part.availability} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/parts/${part.id}`}>
                        <button className="text-blue-600 hover:text-blue-700 p-1">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/parts/${part.id}/edit`}>
                        <button className="text-green-600 hover:text-green-700 p-1">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button className="text-red-600 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedParts.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedParts.length} part{selectedParts.length > 1 ? "s" : ""}{" "}
              selected
            </p>
            <div className="flex items-center space-x-3">
              <ActionButton
                icon={Download}
                label="Export Selected"
                variant="secondary"
              />
              <ActionButton icon={Edit} label="Bulk Edit" variant="secondary" />
              <ActionButton
                icon={Trash2}
                label="Delete Selected"
                variant="danger"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PartsPage;
