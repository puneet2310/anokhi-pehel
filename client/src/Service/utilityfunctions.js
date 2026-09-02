import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Download data as CSV file
 * @param {Array} data - Array of objects to download
 * @param {Array} columns - Array of column config objects with { label, key } format
 *                          label: Header name, key: Property name in data object
 * @param {String} filename - Name of the CSV file (without extension)
 */
export const downloadCSV = (data, columns, filename = "export") => {
  // Create header row
  const headers = columns.map(col => col.label);
  
  // Create data rows
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      // Handle values that might contain commas by wrapping in quotes
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
    })
  );

  // Combine headers and rows
  const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  URL.revokeObjectURL(url);
};

/**
 * Download data as PDF file
 * @param {Array} data - Array of objects to download
 * @param {Array} columns - Array of column headers (strings or column config with label/key)
 * @param {String} filename - Name of the PDF file (without extension)
 * @param {String} title - Optional title for the PDF
 * @param {Number} titleFontSize - Font size for title (default: 18)
 * @param {Number} startY - Starting Y position for table (default: title ? 30 : 10)
 */
export const downloadPDF = (data, columns, filename = "export", options = {}) => {
  const {
    title = null,
    titleFontSize = 18,
    startY: customStartY = null,
    dataFontSize = 12
  } = options;

  const doc = new jsPDF();
  let startY = customStartY;

  // Add title if provided
  if (title) {
    doc.setFontSize(titleFontSize);
    doc.text(title, 14, 15);
    doc.setFontSize(dataFontSize);
    if (startY === null) startY = 25;
  } else {
    if (startY === null) startY = 10;
  }

  // Prepare table headers
  const tableHeaders = columns.map(col => 
    typeof col === 'string' ? col : col.label
  );

  // Prepare table body
  const tableBody = data.map(item => 
    columns.map(col => {
      if (typeof col === 'string') {
        // Direct column name (for simple objects)
        const value = item[col];
        return value === null || value === undefined ? "" : String(value);
      } else {
        // Column config with key property
        const value = item[col.key];
        return value === null || value === undefined ? "" : String(value);
      }
    })
  );

  // Add table to PDF
  doc.autoTable({
    head: [tableHeaders],
    body: tableBody,
    startY: startY,
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
};
