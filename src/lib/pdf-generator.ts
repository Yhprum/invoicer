"use client";

import { format, parseISO } from "date-fns";
import { jsPDF } from "jspdf";
import type { Invoice, UserSettings } from "./types";
import { formatCurrency } from "./utils";

export async function generateInvoicePdf(invoice: Invoice, userSettings: UserSettings): Promise<void> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set up document properties
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Define column positions
  const colDate = margin;
  const colDesc = margin + 25;
  const colHours = pageWidth - margin - 60;
  const colRate = pageWidth - margin - 35;
  const colAmount = pageWidth - margin - 10;

  let y = margin;

  // Add title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin, y);
  y += 10;

  // Add invoice number and date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${invoice.number}`, margin, y);
  y += 6;
  doc.text(`Date: ${format(parseISO(invoice.date), "MMMM d, yyyy")}`, margin, y);
  y += 15;

  // Add from/to section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("From:", margin, y);
  doc.text("To:", pageWidth / 2, y);
  y += 7;

  // From details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(userSettings.name, margin, y);
  y += 5;

  // Handle multiline address
  const fromAddressLines = userSettings.address.split("\n");
  fromAddressLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 5;
  });

  // Reset y position for "To" section
  y = y - 5 * fromAddressLines.length + 7;

  // To details
  doc.text(invoice.clientName, pageWidth / 2, y - 5);
  y += 5;

  if (invoice.clientAddress) {
    const toAddressLines = invoice.clientAddress.split("\n");
    toAddressLines.forEach((line) => {
      doc.text(line, pageWidth / 2, y);
      y += 5;
    });
  }

  // Determine which y position is lower and use that
  const fromY = margin + 32 + 5 * fromAddressLines.length;
  const toY = margin + 32 + (invoice.clientAddress ? 5 * invoice.clientAddress.split("\n").length : 0);
  y = Math.max(fromY, toY);
  y += 10;

  // Add table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, pageWidth - 2 * margin, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Date", colDate, y + 6);
  doc.text("Description", colDesc, y + 6);
  doc.text("Hours", colHours, y + 6, { align: "right" });
  doc.text("Rate", colRate, y + 6, { align: "right" });
  doc.text("Amount", colAmount, y + 6, { align: "right" });
  y += 10;

  // Add table rows
  doc.setFont("helvetica", "normal");
  invoice.items.forEach((item) => {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    const itemDate = format(parseISO(item.date), "MM/dd/yyyy");
    const itemHours = item.hours.toFixed(2);
    const itemRate = formatCurrency(userSettings.hourlyRate);
    const itemAmount = formatCurrency(item.hours * userSettings.hourlyRate);

    doc.text(itemDate, colDate, y + 5);

    // Handle long descriptions with proper width constraints
    const descMaxWidth = colHours - colDesc - 10; // Limit description width
    const descriptionLines = doc.splitTextToSize(item.description, descMaxWidth);
    doc.text(descriptionLines, colDesc, y + 5);

    // Right-align numeric columns
    doc.text(itemHours, colHours, y + 5, { align: "right" });
    doc.text(itemRate, colRate, y + 5, { align: "right" });
    doc.text(itemAmount, colAmount, y + 5, { align: "right" });

    // Adjust y position based on number of description lines
    y += Math.max(10, descriptionLines.length * 7);
  });

  // Add total section
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;
  doc.setFont("helvetica", "bold");

  // Position the totals with better spacing
  const labelCol = colHours - 25; // Position for the labels
  doc.text("Total Hours:", labelCol, y, { align: "right" });
  doc.text(invoice.totalHours.toFixed(2), colHours, y, { align: "right" });
  y += 7;
  doc.text("Total Amount:", labelCol, y, { align: "right" });
  doc.text(formatCurrency(invoice.totalAmount), colAmount, y, { align: "right" });

  // Add payment status
  if (invoice.isPaid) {
    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(0, 128, 0); // Green color for paid
    doc.text("PAID", pageWidth / 2, y, { align: "center" });
  }

  // Save the PDF
  doc.save(`Invoice-${invoice.number}.pdf`);
}
