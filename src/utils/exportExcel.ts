// utils/exportUtils.ts
import * as XLSX from "xlsx";
import { AdminPartView, ExportOptions } from "@/types/parts";

export const exportToExcel = (
  data: AdminPartView[],
  options: ExportOptions
) => {
  const { format, includeImages, selectedColumns, filename } = options;

  // Define all available columns
  const allColumns = {
    partNumber: "Part Number",
    name: "Name",
    category: "Category",
    subcategory: "Subcategory",
    brand: "Brand",
    description: "Description",
    priceFormatted: "Price",
    discountFormatted: "Discount",
    stockQty: "Stock Quantity",
    stockStatus: "Stock Status",
    availability: "Availability",
    rating: "Rating",
    isActiveText: "Status",
    createdAtFormatted: "Created Date",
    createdBy: "Created By",
    updatedAtFormatted: "Updated Date",
  };

  // Filter columns based on selection
  const columnsToExport =
    selectedColumns.length > 0 ? selectedColumns : Object.keys(allColumns);

  // Prepare data for export
  const exportData = data.map((part) => {
    const row: any = {};

    columnsToExport.forEach((column) => {
      const label = allColumns[column as keyof typeof allColumns] || column;

      switch (column) {
        case "createdBy":
          row[label] = `${part.createdBy.firstName} ${part.createdBy.lastName}`;
          break;
        case "images":
          if (includeImages) {
            row[label] = part.images.join(", ");
          }
          break;
        case "compatibleModels":
          row[label] = part.compatibleModels.join(", ");
          break;
        case "specifications":
          row[label] = JSON.stringify(part.specifications);
          break;
        default:
          row[label] = part[column as keyof AdminPartView] || "";
      }
    });

    return row;
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...exportData.map((row) => String(row[key] || "").length)
    ),
  }));
  worksheet["!cols"] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Parts");

  // Generate filename
  const timestamp = new Date().toISOString().split("T")[0];
  const defaultFilename = `parts-export-${timestamp}`;
  const finalFilename = filename || defaultFilename;

  // Export file
  if (format === "xlsx") {
    XLSX.writeFile(workbook, `${finalFilename}.xlsx`);
  } else {
    XLSX.writeFile(workbook, `${finalFilename}.csv`);
  }
};

export const exportFilteredData = (
  data: AdminPartView[],
  filters: any,
  format: "xlsx" | "csv" = "xlsx"
) => {
  const timestamp = new Date().toISOString().split("T")[0];
  const filterDescription = Object.entries(filters)
    .filter(([_, value]) => value && value !== "all")
    .map(([key, value]) => `${key}-${value}`)
    .join("_");

  const filename = `parts-${filterDescription || "all"}-${timestamp}`;

  exportToExcel(data, {
    format,
    includeImages: false,
    selectedColumns: [],
    filename,
  });
};

// Utility to get column options for export dialog
export const getExportColumnOptions = () => [
  { value: "partNumber", label: "Part Number" },
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "subcategory", label: "Subcategory" },
  { value: "brand", label: "Brand" },
  { value: "description", label: "Description" },
  { value: "priceFormatted", label: "Price" },
  { value: "discountFormatted", label: "Discount" },
  { value: "stockQty", label: "Stock Quantity" },
  { value: "stockStatus", label: "Stock Status" },
  { value: "availability", label: "Availability" },
  { value: "rating", label: "Rating" },
  { value: "isActiveText", label: "Status" },
  { value: "createdAtFormatted", label: "Created Date" },
  { value: "createdBy", label: "Created By" },
  { value: "updatedAtFormatted", label: "Updated Date" },
  { value: "images", label: "Images" },
  { value: "compatibleModels", label: "Compatible Models" },
  { value: "specifications", label: "Specifications" },
];
