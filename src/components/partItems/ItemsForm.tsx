import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Package,
  Barcode,
  MapPin,
  DollarSign,
  FileText,
  Truck,
  AlertCircle,
  CheckCircle,
  Loader2,
  Scan,
} from "lucide-react";
import {
  useCreatePartItem,
  useUpdatePartItem,
  useCheckBarcode,
} from "@/hooks/items/useCreateItems";
import { CompanyI } from "@/types";

// Updated PartItem interface to match your type definition
export interface PartItem {
  id: string;
  partId: string;
  barCode?: string;
  location: string;
  status: "available" | "reserved" | "sold" | "damaged" | "maintenance";
  condition: "new" | "used" | "refurbished" | "damaged";
  serialNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shelveLocation?: string;
  supplierId?: string;
  purchasePrice: number;
  purchaseDate?: string;
  expiryDate?: string;
  warrantyPeriod?: number;
  quotationId?: string;
  assignedTo?: string;
  addedOn?: string;
  addedBy?: string;
}

interface PartItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  partId: string;
  selectedItem?: PartItem | null;
  onSave?: (item: PartItem) => void;
  suppliers?: CompanyI[];
}

// Form data type for internal form state
type PartItemFormData = {
  id?: string;
  barCode?: string;
  serialNumber?: string;
  location: string;
  shelveLocation?: string;
  supplierId?: string;
  purchasePrice: string; 
  purchaseDate?: string;
  expiryDate?: string;
  warrantyPeriod?: number;
  condition: "new" | "used" | "refurbished" | "damaged";
  status: "available" | "reserved" | "sold" | "damaged" | "maintenance";
  quotationId?: string;
  notes?: string;
};

const cleanFormData = (formData: PartItemFormData) => {
  const cleaned: any = {};

  // Only include non-empty strings
  if (formData.barCode?.trim()) cleaned.barCode = formData.barCode.trim();
  if (formData.serialNumber?.trim())
    cleaned.serialNumber = formData.serialNumber.trim();
  if (formData.location?.trim()) cleaned.location = formData.location.trim();
  if (formData.shelveLocation?.trim())
    cleaned.shelveLocation = formData.shelveLocation.trim();
  if (formData.supplierId?.trim())
    cleaned.supplierId = formData.supplierId.trim();
  if (formData.quotationId?.trim())
    cleaned.quotationId = formData.quotationId.trim();
  if (formData.notes?.trim()) cleaned.notes = formData.notes.trim();

  // Always include these required fields
  cleaned.condition = formData.condition;
  cleaned.status = formData.status;

  // Only include numeric values if they're greater than 0
  if (formData.purchasePrice && parseFloat(formData.purchasePrice) > 0) {
    cleaned.purchasePrice = parseFloat(formData.purchasePrice);
  }

  if (formData.warrantyPeriod && formData.warrantyPeriod > 0) {
    cleaned.warrantyPeriod = formData.warrantyPeriod;
  }

  // Only include dates if they're valid
  if (formData.purchaseDate) {
    cleaned.purchaseDate = new Date(formData.purchaseDate).toISOString();
  }

  if (formData.expiryDate) {
    cleaned.expiryDate = new Date(formData.expiryDate).toISOString();
  }

  return cleaned;
};

export default function PartItemForm({
  isOpen,
  onClose,
  partId,
  selectedItem,
  onSave,
  suppliers,
}: PartItemFormProps) {
  const [formData, setFormData] = useState<PartItemFormData>({
    barCode: "",
    serialNumber: "",
    location: "",
    shelveLocation: "",
    supplierId: "",
    purchasePrice: "",
    purchaseDate: "",
    expiryDate: "",
    warrantyPeriod: 0,
    condition: "new",
    status: "available",
    quotationId: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [barcodeChecking, setBarcodeChecking] = useState(false);

  // API mutations
  const createMutation = useCreatePartItem();
  const updateMutation = useUpdatePartItem();
  const checkBarcodeMutation = useCheckBarcode();

  const isEditMode = !!selectedItem;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      if (selectedItem) {
        setFormData({
          ...selectedItem,
          purchasePrice: selectedItem.purchasePrice?.toString() || "",
          purchaseDate: selectedItem.purchaseDate
            ? new Date(selectedItem.purchaseDate).toISOString().split("T")[0]
            : "",
          expiryDate: selectedItem.expiryDate
            ? new Date(selectedItem.expiryDate).toISOString().split("T")[0]
            : "",
        });
      } else {
        setFormData({
          barCode: "",
          serialNumber: "",
          location: "",
          shelveLocation: "",
          supplierId: "",
          purchasePrice: "",
          purchaseDate: "",
          expiryDate: "",
          warrantyPeriod: 0,
          condition: "new",
          status: "available",
          quotationId: "",
          notes: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, selectedItem]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "warrantyPeriod" ? parseInt(value) || 0 : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const checkBarcodeExists = async (barcode: string) => {
    if (!barcode.trim() || (isEditMode && selectedItem?.barCode === barcode))
      return;

    setBarcodeChecking(true);
    try {
      const result = await checkBarcodeMutation.mutateAsync(barcode);
      if (result.exists) {
        setErrors((prev) => ({
          ...prev,
          barCode: "This barcode already exists",
        }));
      }
    } catch (error) {
      console.error("Error checking barcode:", error);
    } finally {
      setBarcodeChecking(false);
    }
  };

  const handleBarcodeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const barcode = e.target.value.trim();
    if (barcode) {
      checkBarcodeExists(barcode);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.barCode?.trim()) {
      newErrors.barCode = "Barcode is required";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.shelveLocation?.trim()) {
      newErrors.shelveLocation = "Shelving location is required";
    }

    if (
      formData.purchasePrice &&
      !/^\d+(\.\d{1,2})?$/.test(formData.purchasePrice)
    ) {
      newErrors.purchasePrice = "Invalid price format";
    }

    if (formData.warrantyPeriod && formData.warrantyPeriod < 0) {
      newErrors.warrantyPeriod = "Warranty period cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let savedItem: PartItem;

      // Clean the form data to remove empty/zero values
      const cleanedData = cleanFormData(formData);

      if (isEditMode && selectedItem?.id) {
        // Update existing item - merge with existing data and cleaned form data
        const updateData: PartItem = {
          ...selectedItem, 
          ...cleanedData, 
          partId,
          id: selectedItem.id,
          createdAt: selectedItem.createdAt,
          updatedAt: selectedItem.updatedAt,
          addedOn: selectedItem.addedOn,
          addedBy: selectedItem.addedBy,
          // Handle assignedTo based on status
          assignedTo:
            cleanedData.status === "reserved" || cleanedData.status === "sold"
              ? selectedItem.assignedTo
              : undefined,
        };

        savedItem = await updateMutation.mutateAsync(updateData);
      } else {
        // Create new item - only include cleaned data
        const createData: Omit<PartItem, "id"> = {
          partId,
          ...cleanedData,
          // These fields will be set by the API
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Optional fields that should be undefined if not provided
          addedOn: undefined,
          addedBy: undefined,
          assignedTo: undefined,
        };

        savedItem = await createMutation.mutateAsync(createData);
      }

      // Call onSave callback if provided
      if (onSave) {
        onSave(savedItem);
      }

      // Close the form
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to save item",
      });
    }
  };

  const generateBarcode = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newBarcode = `CAT${timestamp}${random}`;
    setFormData((prev) => ({
      ...prev,
      barCode: newBarcode,
    }));

    // Check if the generated barcode exists
    checkBarcodeExists(newBarcode);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-yellow-400 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-black/10 rounded-lg">
                  <Package className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">
                    {isEditMode ? "Edit" : "Add"} Part Item
                  </h2>
                  <p className="text-black/70 text-sm">
                    Caterpillar Inventory System
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-black/70 hover:text-black hover:bg-black/10 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {/* Global Error Message */}
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Error saving item:</span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Item Identification */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Barcode className="h-5 w-5 text-yellow-600" />
                      <span>Item Identification</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Barcode <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              name="barCode"
                              value={formData.barCode}
                              onChange={handleInputChange}
                              onBlur={handleBarcodeBlur}
                              placeholder="Enter or generate barcode"
                              disabled={isSubmitting}
                              className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                errors.barCode
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              }`}
                            />
                            {barcodeChecking && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={generateBarcode}
                            disabled={isSubmitting || barcodeChecking}
                            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Scan className="h-4 w-4" />
                            <span>Generate</span>
                          </button>
                        </div>
                        {errors.barCode && (
                          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errors.barCode}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Serial Number
                        </label>
                        <input
                          type="text"
                          name="serialNumber"
                          value={formData.serialNumber}
                          onChange={handleInputChange}
                          placeholder="Enter serial number"
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-yellow-600" />
                      <span>Location Details</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                            errors.location
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select location</option>
                          <option value="Juakar">Juakar</option>
                          <option value="Gahanga">Gahanga</option>
                        </select>
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errors.location}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shelf Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="shelveLocation"
                          value={formData.shelveLocation}
                          onChange={handleInputChange}
                          placeholder="e.g., A-15-B3"
                          disabled={isSubmitting}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                            errors.shelveLocation
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.shelveLocation && (
                          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errors.shelveLocation}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Condition */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-yellow-600" />
                      <span>Status & Condition</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="sold">Sold</option>
                          <option value="damaged">Damaged</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condition
                        </label>
                        <select
                          name="condition"
                          value={formData.condition}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="new">New</option>
                          <option value="refurbished">Refurbished</option>
                          <option value="used">Used</option>
                          <option value="damaged">Damaged</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Supplier Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-yellow-600" />
                      <span>Supplier Information</span>
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier
                      </label>
                      <select
                        name="supplierId"
                        value={formData.supplierId}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select supplier</option>
                        {suppliers?.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      <span>Financial Details</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Purchase Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            name="purchasePrice"
                            value={formData.purchasePrice}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            disabled={isSubmitting}
                            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                              errors.purchasePrice
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.purchasePrice && (
                          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errors.purchasePrice}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Purchase Date
                        </label>
                        <input
                          type="date"
                          name="purchaseDate"
                          value={formData.purchaseDate}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warranty (months)
                        </label>
                        <input
                          type="number"
                          name="warrantyPeriod"
                          value={formData.warrantyPeriod}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                          disabled={isSubmitting}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                            errors.warrantyPeriod
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.warrantyPeriod && (
                          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errors.warrantyPeriod}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-yellow-600" />
                      <span>Additional Information</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quotation ID
                        </label>
                        <input
                          type="text"
                          name="quotationId"
                          value={formData.quotationId}
                          onChange={handleInputChange}
                          placeholder="Enter quotation ID"
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Enter any additional notes..."
                          rows={3}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || barcodeChecking}
                  className="flex items-center space-x-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{isEditMode ? "Update Item" : "Create Item"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
