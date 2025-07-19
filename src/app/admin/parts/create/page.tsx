"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  Package,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit3,
  Copy,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Scan,
  Archive,
  Loader2,
  Info,
  Settings,
  Tag,
  Truck,
  Shield,
  Wrench,
  Building,
  Phone,
  Mail,
  Globe,
  Star,
  Camera,
  Eye,
} from "lucide-react";

interface PartFormData {
  partNumber: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  compatibleModels: string[];
  specifications: Record<string, any>;
  images: string[];
  price: string;
  discount: string;
  costPrice: string;
  weight: string;
  dimensions: string;
  minimumStock: number;
  isActive: boolean;
}

interface ImageData {
  file: File;
  preview: string;
  uploaded?: boolean;
  uploading?: boolean;
  url?: string;
  error?: string;
}

// Import the real upload function
import { uploadImage } from "@/server/actions";
import { useCreatePart } from "@/hooks/parts/useCreatePart";

const EnhancedPartCreation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "specifications" | "pricing" | "inventory"
  >("basic");
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PartFormData>({
    partNumber: "",
    name: "",
    description: "",
    brand: "",
    category: "",
    subcategory: "",
    compatibleModels: [],
    specifications: {},
    images: [],
    price: "",
    discount: "0",
    costPrice: "",
    weight: "",
    dimensions: "",
    minimumStock: 0,
    isActive: true,
  });

  const [imageData, setImageData] = useState<ImageData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [compatibleModel, setCompatibleModel] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const createPartMutation = useCreatePart();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size limit: 1MB (1024 * 1024 bytes)
  const MAX_FILE_SIZE = 1024 * 1024; // 1MB

  const categories = [
    "Engine Components",
    "Hydraulic Systems",
    "Electrical Parts",
    "Transmission",
    "Undercarriage",
    "Cooling System",
    "Fuel System",
    "Brake Components",
    "Steering System",
    "Filtration",
    "Exhaust System",
    "Attachment Parts",
    "Cabin & Interior",
    "Safety Equipment",
    "Maintenance Tools",
    "Other",
  ];

  const brands = [
    "Caterpillar",
    "Komatsu",
    "Volvo Construction",
    "Hitachi",
    "JCB",
  ];

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Sync imageData with formData.images
  useEffect(() => {
    const uploadedUrls = imageData
      .filter((img) => img.uploaded && img.url)
      .map((img) => img.url!);

    setFormData((prev) => ({
      ...prev,
      images: uploadedUrls,
    }));
  }, [imageData]);

  // Reset form after successful creation
  useEffect(() => {
    if (createPartMutation.isSuccess) {
      setSubmitSuccess(true);
      const timer = setTimeout(() => {
        setFormData({
          partNumber: "",
          name: "",
          description: "",
          brand: "",
          category: "",
          subcategory: "",
          compatibleModels: [],
          specifications: {},
          images: [],
          price: "",
          discount: "0",
          costPrice: "",
          weight: "",
          dimensions: "",
          minimumStock: 0,
          isActive: true,
        });
        setImageData([]);
        setActiveTab("basic");
        setErrors({});
        setSubmitSuccess(false);
        setSubmitError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [createPartMutation.isSuccess]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.partNumber) newErrors.partNumber = "Part number is required";
    if (!formData.name) newErrors.name = "Part name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price) newErrors.price = "Price is required";
    else if (parseFloat(formData.price) <= 0)
      newErrors.price = "Price must be greater than 0";

    if (
      formData.discount &&
      (parseFloat(formData.discount) < 0 || parseFloat(formData.discount) > 100)
    ) {
      newErrors.discount = "Discount must be between 0 and 100";
    }

    const uploadedImages = imageData.filter((img) => img.uploaded && img.url);
    if (uploadedImages.length === 0 && imageData.length > 0) {
      newErrors.images = "Please upload all selected images";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message: string, type: "success" | "error") => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    const hasUnuploadedImages = imageData.some(
      (img) => !img.uploaded && !img.uploading
    );
    if (hasUnuploadedImages) {
      showToast(
        "Please upload all selected images before creating the part",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createPartMutation.mutate(formData);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validImageFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image file`);
        return;
      }

      // Check file size (1MB limit)
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.name} is too large (${formatFileSize(
            file.size
          )}). Maximum size is 1MB`
        );
        return;
      }

      validImageFiles.push(file);
    });

    // Show error messages for invalid files
    errors.forEach((error) => {
      showToast(error, "error");
    });

    // Process valid files
    if (validImageFiles.length > 0) {
      const newImageData: ImageData[] = validImageFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
        uploading: false,
      }));

      setImageData((prev) => [...prev, ...newImageData]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadSingleImage = async (index: number) => {
    const imageItem = imageData[index];
    if (!imageItem || imageItem.uploaded || imageItem.uploading) return;

    setImageData((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, uploading: true, error: undefined } : item
      )
    );

    try {
      const formData = new FormData();
      formData.append("file", imageItem.file);

      // Use the real uploadImage function from server actions
      const result = await uploadImage(formData);

      console.log("Upload result:", result);

      if (result.success && result.image) {
        setImageData((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  uploaded: true,
                  uploading: false,
                  url: result.image?.secure_url,
                  error: undefined,
                }
              : item
          )
        );
        showToast("Image uploaded successfully", "success");
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setImageData((prev) =>
        prev.map((item, i) =>
          i === index
            ? { ...item, uploading: false, error: errorMessage }
            : item
        )
      );
      showToast(`Failed to upload image: ${errorMessage}`, "error");
    }
  };

  const uploadAllImages = async () => {
    const unuploadedIndexes = imageData
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.uploaded && !item.uploading)
      .map(({ index }) => index);

    if (unuploadedIndexes.length === 0) {
      showToast("All images are already uploaded", "success");
      return;
    }

    await Promise.all(
      unuploadedIndexes.map((index) => uploadSingleImage(index))
    );
  };

  const retryUpload = (index: number) => {
    uploadSingleImage(index);
  };

  const removeImage = (index: number) => {
    const imageItem = imageData[index];
    if (imageItem.preview) {
      URL.revokeObjectURL(imageItem.preview);
    }
    setImageData((prev) => prev.filter((_, i) => i !== index));
  };

  const previewImageHandler = (imageSrc: string) => {
    setPreviewImage(imageSrc);
  };

  const addCompatibleModel = () => {
    if (compatibleModel.trim()) {
      setFormData((prev) => ({
        ...prev,
        compatibleModels: [...prev.compatibleModels, compatibleModel.trim()],
      }));
      setCompatibleModel("");
    }
  };

  const removeCompatibleModel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      compatibleModels: prev.compatibleModels.filter((_, i) => i !== index),
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const isFormValid =
    formData.name && formData.partNumber && formData.category && formData.price;

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Package },
    { id: "specifications", label: "Specifications", icon: Settings },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "inventory", label: "Inventory", icon: Archive },
  ];

  const ErrorMessage = ({ message }: { message: string }) => (
    <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </p>
  );

  const InputField = ({
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
    icon: Icon,
    ...props
  }: any) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        )}
        <input
          type={type}
          name={name}
          value={formData[name as keyof PartFormData]}
          onChange={handleChange}
          className={`w-full ${
            Icon ? "pl-11" : "pl-4"
          } pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ${
            errors[name]
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          placeholder={placeholder}
          {...props}
        />
      </div>
      {errors[name] && <ErrorMessage message={errors[name]} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50">
      <div className="w-full mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-xl shadow-lg">
              <Package className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Part
              </h1>
              <p className="text-gray-600">
                Add a new part to your CAT equipment inventory
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-3 px-8 py-6 font-semibold transition-all duration-300 relative ${
                    activeTab === tab.id
                      ? "text-yellow-600 bg-yellow-50 border-b-4 border-yellow-500"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Enhanced Tab Content */}
          <div className="p-8">
            {/* Error Banner */}
            {submitError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800">
                    Error Creating Part
                  </h4>
                  <p className="text-red-600 text-sm">{submitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {activeTab === "basic" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputField
                      label="Part Name"
                      name="name"
                      required
                      placeholder="Enter part name"
                      icon={Package}
                    />

                    <InputField
                      label="Part Number"
                      name="partNumber"
                      required
                      placeholder="Enter part number"
                      icon={QrCode}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ${
                            errors.category
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.category && (
                        <ErrorMessage message={errors.category} />
                      )}
                    </div>

                    <InputField
                      label="Subcategory"
                      name="subcategory"
                      placeholder="Enter subcategory"
                      icon={Tag}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Brand
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 hover:border-gray-400"
                        >
                          <option value="">Select brand</option>
                          {brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 pt-8">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="w-5 h-5 text-yellow-600 border-gray-300 rounded-lg focus:ring-yellow-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 hover:border-gray-400 resize-none"
                      placeholder="Detailed description of the part..."
                    />
                  </div>

                  {/* Enhanced Compatible Models */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Compatible Models
                    </label>
                    <div className="flex space-x-3 mb-3">
                      <div className="relative flex-1">
                        <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={compatibleModel}
                          onChange={(e) => setCompatibleModel(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addCompatibleModel())
                          }
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                          placeholder="e.g., CAT 320D, 2018-2024"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCompatibleModel}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {formData.compatibleModels.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.compatibleModels.map((model, index) => (
                          <span
                            key={index}
                            className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                          >
                            <span>{model}</span>
                            <button
                              type="button"
                              onClick={() => removeCompatibleModel(index)}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Images
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-semibold text-lg">
                          Drop images here or click to select
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          PNG, JPG, GIF up to 1MB each
                        </p>
                      </label>
                    </div>

                    {imageData.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-800">
                            Selected Images ({imageData.length})
                          </h4>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={uploadAllImages}
                              disabled={imageData.every(
                                (img) => img.uploaded || img.uploading
                              )}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center space-x-2"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Upload All</span>
                            </button>
                            <div className="text-xs text-gray-500 flex items-center">
                              Uploaded:{" "}
                              {imageData.filter((img) => img.uploaded).length}/
                              {imageData.length}
                            </div>
                          </div>
                        </div>

                        {/* Debug: Show current formData.images */}
                        {formData.images.length > 0 && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs">
                            <strong className="text-blue-800">
                              URLs ready for submission (
                              {formData.images.length}):
                            </strong>
                            <ul className="mt-1 space-y-1">
                              {formData.images.map((url, idx) => (
                                <li
                                  key={idx}
                                  className="truncate text-blue-600"
                                >
                                  {url}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {imageData.map((imageItem, index) => (
                            <div
                              key={index}
                              className="relative group bg-white rounded-xl border-2 border-gray-200 p-2"
                            >
                              <img
                                src={imageItem.preview}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />

                              {/* File size indicator */}
                              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                {formatFileSize(imageItem.file.size)}
                              </div>

                              {/* Status Overlay */}
                              <div className="absolute top-2 right-2 flex gap-1">
                                {imageItem.uploaded && (
                                  <div className="bg-green-500 text-white rounded-full p-1">
                                    <CheckCircle className="h-4 w-4" />
                                  </div>
                                )}
                                {imageItem.uploading && (
                                  <div className="bg-yellow-500 text-black rounded-full p-1">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                )}
                                {imageItem.error && (
                                  <div className="bg-red-500 text-white rounded-full p-1">
                                    <AlertCircle className="h-4 w-4" />
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    previewImageHandler(imageItem.preview)
                                  }
                                  className="bg-yellow-500 text-black rounded-full p-2 hover:bg-yellow-600 transition-colors"
                                  title="Preview"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {!imageItem.uploaded &&
                                  !imageItem.uploading && (
                                    <button
                                      type="button"
                                      onClick={() => uploadSingleImage(index)}
                                      className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-colors"
                                      title="Upload"
                                    >
                                      <Upload className="h-4 w-4" />
                                    </button>
                                  )}

                                {imageItem.error && (
                                  <button
                                    type="button"
                                    onClick={() => retryUpload(index)}
                                    className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
                                    title="Retry Upload"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                  title="Remove"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Upload Progress or Status */}
                              <div className="mt-2 text-center">
                                {imageItem.uploading && (
                                  <p className="text-xs text-yellow-600 font-semibold">
                                    Uploading...
                                  </p>
                                )}
                                {imageItem.uploaded && (
                                  <p className="text-xs text-green-600 font-semibold">
                                    Uploaded ✓
                                  </p>
                                )}
                                {imageItem.error && (
                                  <p className="text-xs text-red-600 font-semibold">
                                    Failed - Click retry
                                  </p>
                                )}
                                {!imageItem.uploaded &&
                                  !imageItem.uploading &&
                                  !imageItem.error && (
                                    <p className="text-xs text-gray-500 font-semibold">
                                      Ready to upload
                                    </p>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {errors.images && <ErrorMessage message={errors.images} />}
                  </div>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Physical Properties
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Weight"
                        name="weight"
                        placeholder="e.g., 45.2 kg"
                        icon={Package}
                      />

                      <InputField
                        label="Dimensions"
                        name="dimensions"
                        placeholder="e.g., 420mm x 280mm x 350mm"
                        icon={Package}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Custom Specifications
                    </label>
                    <div className="flex space-x-3 mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={specKey}
                          onChange={(e) => setSpecKey(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Specification name"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={specValue}
                          onChange={(e) => setSpecValue(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addSpecification())
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Specification value"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addSpecification}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>

                    {Object.entries(formData.specifications).length > 0 && (
                      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                        <div className="space-y-3">
                          {Object.entries(formData.specifications).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                              >
                                <div>
                                  <span className="font-semibold text-gray-900">
                                    {key}:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {value}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSpecification(key)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField
                      label="Selling Price"
                      name="price"
                      type="number"
                      required
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      icon={DollarSign}
                    />

                    <InputField
                      label="Cost Price"
                      name="costPrice"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      icon={DollarSign}
                    />

                    <InputField
                      label="Discount (%)"
                      name="discount"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      icon={DollarSign}
                    />
                  </div>

                  {formData.price && (
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
                      <h3 className="font-bold text-yellow-900 mb-4">
                        Pricing Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-yellow-600">List Price</p>
                          <p className="text-2xl font-bold text-yellow-900">
                            ${parseFloat(formData.price || "0").toFixed(2)}
                          </p>
                        </div>
                        {formData.discount &&
                          parseFloat(formData.discount) > 0 && (
                            <>
                              <div>
                                <p className="text-sm text-green-600">
                                  Discount
                                </p>
                                <p className="text-2xl font-bold text-green-700">
                                  {formData.discount}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-purple-600">
                                  Final Price
                                </p>
                                <p className="text-2xl font-bold text-purple-900">
                                  $
                                  {(
                                    parseFloat(formData.price || "0") *
                                    (1 -
                                      parseFloat(formData.discount || "0") /
                                        100)
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </>
                          )}
                        {formData.costPrice && (
                          <div>
                            <p className="text-sm text-gray-600">
                              Profit Margin
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {(
                                ((parseFloat(formData.price || "0") -
                                  parseFloat(formData.costPrice || "0")) /
                                  parseFloat(formData.price || "1")) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "inventory" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Minimum Stock Level"
                      name="minimumStock"
                      type="number"
                      placeholder="0"
                      min="0"
                      icon={Archive}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-yellow-500 p-3 rounded-lg">
                        <Info className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold text-yellow-900">
                          Inventory Management
                        </h3>
                        <p className="text-yellow-700 text-sm">
                          Configure stock tracking and alerts
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-4 border border-yellow-200">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Stock Alerts
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          You'll be notified when stock falls below the minimum
                          level
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Alert Threshold:
                          </span>
                          <span className="font-bold text-yellow-600">
                            {formData.minimumStock || 0} units
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-yellow-200">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Tracking
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          Individual items will be tracked with barcodes and
                          locations
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`font-bold ${
                              formData.isActive
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {formData.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Enhanced Summary Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Part Creation Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  {isFormValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                  <span
                    className={
                      isFormValid ? "text-green-700" : "text-orange-700"
                    }
                  >
                    Form {isFormValid ? "Complete" : "Incomplete"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">
                    {imageData.filter((img) => img.uploaded).length}/
                    {imageData.length} Images Uploaded
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-black" />
                  <span className="text-gray-700">
                    {formData.compatibleModels.length} Compatible Models
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-yellow-600" />
                  <span className="text-gray-700">
                    {Object.keys(formData.specifications).length} Specifications
                  </span>
                </div>
              </div>
            </div>

            {formData.price && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                <p className="text-4xl font-black text-yellow-600">
                  ${parseFloat(formData.price || "0").toFixed(2)}
                </p>
                {formData.discount && parseFloat(formData.discount) > 0 && (
                  <p className="text-sm text-green-600 font-semibold">
                    {formData.discount}% discount applied
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Completion Progress
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(
                  (((formData.name ? 1 : 0) +
                    (formData.partNumber ? 1 : 0) +
                    (formData.category ? 1 : 0) +
                    (formData.price ? 1 : 0) +
                    (formData.description ? 1 : 0) +
                    (imageData.some((img) => img.uploaded) ? 1 : 0)) /
                    6) *
                    100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                style={{
                  width: `${
                    (((formData.name ? 1 : 0) +
                      (formData.partNumber ? 1 : 0) +
                      (formData.category ? 1 : 0) +
                      (formData.price ? 1 : 0) +
                      (formData.description ? 1 : 0) +
                      (imageData.some((img) => img.uploaded) ? 1 : 0)) /
                      6) *
                    100
                  }%`,
                }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Save as Draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || createPartMutation.isPending}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 text-black rounded-xl font-bold transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl disabled:shadow-none transform disabled:scale-100"
            >
              {createPartMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Part...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Create Part</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {submitSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Part Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                {formData.name || "Your part"} has been added to your CAT
                inventory system.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-3 border-2 border-yellow-500 text-yellow-600 rounded-xl hover:bg-yellow-50 transition-colors font-semibold"
                >
                  Create Another
                </button>
                <button className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl transition-colors font-semibold">
                  View Part
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPartCreation;
