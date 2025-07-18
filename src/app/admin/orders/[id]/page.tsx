// app/admin/order/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Edit, 
  FileText, 
  Download, 
  Upload, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle,
  Calendar,
  User,
  Package,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Trash2,
  ArrowLeft,
  LucideIcon
} from 'lucide-react';

// Mock UI Components (you can replace these with your actual UI library)
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ActionButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}: { 
  icon: LucideIcon; 
  label: string; 
  onClick: () => void; 
  variant?: 'primary' | 'secondary' | 'danger'; 
  disabled?: boolean; 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'secondary': return 'bg-gray-200 hover:bg-gray-300 text-gray-900';
      default: return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${getVariantClasses()} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );
};

// Interfaces
interface OrderItem {
  id: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

interface OrderDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  size: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  documents: OrderDocument[];
  isPaid: boolean;
  paymentMethod?: string;
  paymentDate?: string;
}

// Mock Data
const mockOrders: Record<string, OrderDetails> = {
  '1': {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: {
      id: 'cust-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Tech Solutions Inc.'
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      country: 'USA'
    },
    items: [
      {
        id: 'item-1',
        partNumber: 'PT-001',
        partName: 'Industrial Valve',
        quantity: 2,
        unitPrice: 450.00,
        totalPrice: 900.00,
        description: 'High-pressure industrial valve for manufacturing'
      },
      {
        id: 'item-2',
        partNumber: 'PT-002',
        partName: 'Pressure Gauge',
        quantity: 1,
        unitPrice: 125.00,
        totalPrice: 125.00,
        description: 'Digital pressure gauge with LCD display'
      }
    ],
    subtotal: 1025.00,
    tax: 82.00,
    shipping: 25.00,
    total: 1132.00,
    status: 'processing',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    estimatedDelivery: '2024-01-25T00:00:00Z',
    trackingNumber: 'TRK123456789',
    notes: 'Customer requested expedited shipping due to urgent project deadline.',
    documents: [
      {
        id: 'doc-1',
        name: 'Purchase Order.pdf',
        type: 'purchase_order',
        url: '#',
        uploadedAt: '2024-01-15T10:30:00Z',
        size: '245 KB'
      },
      {
        id: 'doc-2',
        name: 'Payment Receipt.pdf',
        type: 'payment',
        url: '#',
        uploadedAt: '2024-01-16T09:15:00Z',
        size: '156 KB'
      }
    ],
    isPaid: true,
    paymentMethod: 'Credit Card',
    paymentDate: '2024-01-15T11:00:00Z'
  },
  '2': {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: {
      id: 'cust-002',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1 (555) 987-6543',
      company: 'Manufacturing Corp'
    },
    billingAddress: {
      street: '789 Business Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    shippingAddress: {
      street: '789 Business Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    items: [
      {
        id: 'item-3',
        partNumber: 'PT-003',
        partName: 'Motor Assembly',
        quantity: 1,
        unitPrice: 1200.00,
        totalPrice: 1200.00,
        description: '5HP electric motor assembly'
      }
    ],
    subtotal: 1200.00,
    tax: 96.00,
    shipping: 50.00,
    total: 1346.00,
    status: 'pending',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
    notes: '',
    documents: [],
    isPaid: false
  }
};

export default function AdminOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchOrder = () => {
      const mockOrder = mockOrders[orderId];
      if (mockOrder) {
        setOrder(mockOrder);
        setNotes(mockOrder.notes || '');
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    if (order) {
      const updatedOrder = { ...order, status: newStatus, updatedAt: new Date().toISOString() };
      setOrder(updatedOrder);
      // Here you would typically make an API call to update the order
      console.log(`Updating order ${orderId} status to ${newStatus}`);
    }
  };

  const handleDocumentUpload = async (orderId: string, file: File, type: string) => {
    // Simulate file upload
    const newDocument: OrderDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: type as string,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      size: `${Math.round(file.size / 1024)} KB`
    };

    if (order) {
      const updatedOrder = { ...order, documents: [...order.documents, newDocument] };
      setOrder(updatedOrder);
    }
  };

  const handleDocumentDelete = (orderId: string, documentId: string) => {
    if (order) {
      const updatedOrder = { 
        ...order, 
        documents: order.documents.filter(doc => doc.id !== documentId) 
      };
      setOrder(updatedOrder);
    }
  };

  const handleNotesUpdate = (orderId: string, newNotes: string) => {
    if (order) {
      const updatedOrder = { ...order, notes: newNotes };
      setOrder(updatedOrder);
      // Here you would typically make an API call to update the order notes
      console.log(`Updating order ${orderId} notes`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadingDocument(true);
      try {
        await handleDocumentUpload(orderId, file, type);
      } catch (error) {
        console.error('Error uploading document:', error);
      } finally {
        setUploadingDocument(false);
      }
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleNotesSubmit = () => {
    handleNotesUpdate(orderId, notes);
    setIsEditingNotes(false);
  };

  const getStatusActions = () => {
    if (!order) return [];
    
    const actions = [];
    
    if (order.status === 'pending') {
      actions.push(
        <ActionButton
          key="process"
          icon={Clock}
          label="Mark as Processing"
          onClick={() => handleStatusUpdate(order.id, 'processing')}
        />
      );
    }
    
    if (order.status === 'processing') {
      actions.push(
        <ActionButton
          key="ship"
          icon={Truck}
          label="Mark as Shipped"
          onClick={() => handleStatusUpdate(order.id, 'shipped')}
        />
      );
    }
    
    if (order.status === 'shipped') {
      actions.push(
        <ActionButton
          key="complete"
          icon={CheckCircle}
          label="Mark as Completed"
          onClick={() => handleStatusUpdate(order.id, 'completed')}
        />
      );
    }
    
    if (order.status === 'pending' || order.status === 'processing') {
      actions.push(
        <ActionButton
          key="cancel"
          icon={XCircle}
          label="Cancel Order"
          variant="danger"
          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
        />
      );
    }
    
    return actions;
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      payment: 'Payment Receipt',
      ebm: 'EBM Document',
      purchase_order: 'Purchase Order',
      invoice: 'Invoice',
      other: 'Other Document'
    };
    return labels[type as keyof typeof labels] || 'Document';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.push('/admin/orders')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/orders')}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </button>
        </div>

        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Created on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status={order.status} />
                <div className="flex items-center space-x-2">
                  {getStatusActions()}
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                  {order.customer.company && (
                    <p className="text-sm text-gray-600">{order.customer.company}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{order.customer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{order.customer.phone}</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <div className="text-sm text-gray-600">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <Package className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Part Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Part Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {item.partNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.partName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Order Summary */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">{formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-medium text-gray-900">
                  {order.isPaid ? (
                    <span className="text-green-600">Paid</span>
                  ) : (
                    <span className="text-red-600">Unpaid</span>
                  )}
                </p>
              </div>
              {order.paymentMethod && (
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                </div>
              )}
              {order.paymentDate && (
                <div>
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Order Documents */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Order Documents</h2>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'other')}
                  className="hidden"
                  id="document-upload"
                />
                <ActionButton
                  icon={Upload}
                  label="Upload Document"
                  variant="secondary"
                  onClick={() => document.getElementById('document-upload')?.click()}
                  disabled={uploadingDocument}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              {order.documents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No documents uploaded yet
                </p>
              ) : (
                order.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {getDocumentTypeLabel(doc.type)} • {doc.size} • 
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="View Document"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Download Document"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = doc.url;
                          link.download = doc.name;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete Document"
                        onClick={() => handleDocumentDelete(order.id, doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Order Notes */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Notes</h2>
              <ActionButton
                icon={Edit}
                label={isEditingNotes ? "Cancel" : "Edit"}
                variant="secondary"
                onClick={() => {
                  setIsEditingNotes(!isEditingNotes);
                  if (isEditingNotes) {
                    setNotes(order.notes || '');
                  }
                }}
              />
            </div>
            
            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  rows={4}
                  placeholder="Add notes about this order..."
                />
                <div className="flex items-center space-x-2">
                  <ActionButton
                    icon={CheckCircle}
                    label="Save Notes"
                    onClick={handleNotesSubmit}
                  />
                  <ActionButton
                    icon={XCircle}
                    label="Cancel"
                    variant="secondary"
                    onClick={() => {
                      setIsEditingNotes(false);
                      setNotes(order.notes || '');
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                {order.notes ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No notes added yet</p>
                )}
              </div>
            )}
          </Card>

          {/* Order Timeline */}
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {order.estimatedDelivery && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tracking Number</p>
                    <p className="text-xs text-gray-500">{order.trackingNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}