"use client"

import { jsPDF } from "jspdf"
import { format, parseISO } from "date-fns"
import type { Invoice, UserSettings } from "./types"
import { formatCurrency } from "./utils"

export async function generateInvoicePdf(invoice: Invoice, userSettings: UserSettings): Promise<void> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set up document properties
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const col1 = margin
  const col2 = pageWidth - margin
  let y = margin

  // Add title
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("INVOICE", col1, y)
  y += 10

  // Add invoice number and date
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Invoice #: ${invoice.number}`, col1, y)
  y += 6
  doc.text(`Date: ${format(parseISO(invoice.date), "MMMM d, yyyy")}`, col1, y)
  y += 15

  // Add from/to section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("From:", col1, y)
  doc.text("To:", pageWidth / 2, y)
  y += 7

  // From details
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(userSettings.name, col1, y)
  y += 5

  // Handle multiline address
  const fromAddressLines = userSettings.address.split("\n")
  fromAddressLines.forEach((line) => {
    doc.text(line, col1, y)
    y += 5
  })

  // Reset y position for "To" section
  y = y - 5 * fromAddressLines.length + 7

  // To details
  doc.text(invoice.clientName, pageWidth / 2, y)
  y += 5

  if (invoice.clientAddress) {
    const toAddressLines = invoice.clientAddress.split("\n")
    toAddressLines.forEach((line) => {
      doc.text(line, pageWidth / 2, y)
      y += 5
    })
  }

  // Determine which y position is lower and use that
  const fromY = margin + 32 + 5 * fromAddressLines.length
  const toY = margin + 32 + (invoice.clientAddress ? 5 * invoice.clientAddress.split("\n").length : 0)
  y = Math.max(fromY, toY)
  y += 10

  // Add table header
  doc.setFillColor(240, 240, 240)
  doc.rect(col1, y, pageWidth - 2 * margin, 10, "F")
  doc.setFont("helvetica", "bold")
  doc.text("Date", col1 + 5, y + 6)
  doc.text("Description", col1 + 30, y + 6)
  doc.text("Hours", col2 - 65, y + 6)
  doc.text("Rate", col2 - 40, y + 6)
  doc.text("Amount", col2 - 20, y + 6)
  y += 10

  // Add table rows
  doc.setFont("helvetica", "normal")
  invoice.items.forEach((item) => {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage()
      y = margin
    }

    const itemDate = format(parseISO(item.date), "MM/dd/yyyy")
    const itemHours = item.hours.toFixed(2)
    const itemRate = formatCurrency(userSettings.hourlyRate)
    const itemAmount = formatCurrency(item.hours * userSettings.hourlyRate)

    doc.text(itemDate, col1 + 5, y + 5)

    // Handle long descriptions
    const maxWidth = 100
    const descriptionLines = doc.splitTextToSize(item.description, maxWidth)
    doc.text(descriptionLines, col1 + 30, y + 5)

    doc.text(itemHours, col2 - 65, y + 5, { align: "right" })
    doc.text(itemRate, col2 - 40, y + 5, { align: "right" })
    doc.text(itemAmount, col2 - 20, y + 5, { align: "right" })

    // Adjust y position based on number of description lines
    y += Math.max(10, descriptionLines.length * 7)
  })

  // Add total section
  doc.line(col1, y, col2, y)
  y += 7
  doc.setFont("helvetica", "bold")
  doc.text("Total Hours:", col2 - 65, y, { align: "right" })
  doc.text(invoice.totalHours.toFixed(2), col2 - 40, y, { align: "right" })
  y += 7
  doc.text("Total Amount:", col2 - 65, y, { align: "right" })
  doc.text(formatCurrency(invoice.totalAmount), col2 - 20, y, { align: "right" })

  // Add payment status
  y += 15
  doc.setFontSize(14)
  if (invoice.isPaid) {
    doc.setTextColor(0, 128, 0) // Green color for paid
    doc.text("PAID", pageWidth / 2, y, { align: "center" })
  } else {
    doc.setTextColor(0, 0, 0) // Black for unpaid
    doc.text("Thank you for your business", pageWidth / 2, y, { align: "center" })
  }

  // Save the PDF
  doc.save(`Invoice-${invoice.number}.pdf`)
}
