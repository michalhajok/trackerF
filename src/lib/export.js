/**
 * Export utilities for data export functionality
 */

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Object} options - Export options
 */
export const exportToCsv = (data, filename = "export", options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error("No data to export");
  }

  const {
    delimiter = ",",
    includeHeaders = true,
    dateFormat = "pl-PL",
  } = options;

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  let csvContent = "";

  // Add headers if requested
  if (includeHeaders) {
    csvContent += headers.join(delimiter) + "\n";
  }

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      let value = row[header];

      // Handle different data types
      if (value === null || value === undefined) {
        return "";
      }

      // Format dates
      if (
        value instanceof Date ||
        (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value))
      ) {
        const date = new Date(value);
        return date.toLocaleString(dateFormat);
      }

      // Handle numbers
      if (typeof value === "number") {
        return value.toString();
      }

      // Escape strings that contain delimiter or quotes
      if (typeof value === "string") {
        if (
          value.includes(delimiter) ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
      }

      return value.toString();
    });

    csvContent += values.join(delimiter) + "\n";
  });

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    throw new Error("CSV export not supported in this browser");
  }
};

/**
 * Export data to JSON format
 */
export const exportToJson = (data, filename = "export") => {
  if (!data) {
    throw new Error("No data to export");
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    throw new Error("JSON export not supported in this browser");
  }
};

/**
 * Format cash operations data for export
 */
export const formatCashOperationsForExport = (operations) => {
  return operations.map((op) => ({
    Data: new Date(op.time).toLocaleString("pl-PL"),
    Typ: op.type,
    Kwota: `${op.amount} ${op.currency || "PLN"}`,
    Komentarz: op.comment || "",
    Status: op.status,
    ID: op.id,
  }));
};
