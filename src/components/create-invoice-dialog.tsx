"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TimeEntry, UserSettings, Invoice } from "@/lib/types"
import { format } from "date-fns"
import { generateInvoicePdf } from "@/lib/pdf-generator"
import { formatCurrency } from "@/lib/utils"

interface CreateInvoiceDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedItems: TimeEntry[]
  userSettings: UserSettings
  onCreateInvoice: (invoice: Invoice, items: TimeEntry[]) => void
}

export default function CreateInvoiceDialog({
  isOpen,
  onClose,
  selectedItems,
  userSettings,
  onCreateInvoice,
}: CreateInvoiceDialogProps) {
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const totalHours = selectedItems.reduce((sum, item) => sum + item.hours, 0)
  const totalAmount = totalHours * userSettings.hourlyRate

  const handleCreateInvoice = async () => {
    if (!invoiceNumber || !clientName) return

    setIsGenerating(true)

    try {
      const today = new Date()
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        number: invoiceNumber,
        date: today.toISOString(),
        clientName,
        clientAddress,
        items: selectedItems,
        totalHours,
        totalAmount,
        isPaid: false,
        createdAt: today.toISOString(),
      }

      // Generate PDF
      await generateInvoicePdf(newInvoice, userSettings)

      // Save invoice and remove items from unbilled list
      onCreateInvoice(newInvoice, selectedItems)

      // Reset and close
      setInvoiceNumber("")
      setClientName("")
      setClientAddress("")
      onClose()
    } catch (error) {
      console.error("Error generating invoice:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>Enter the invoice details to generate a PDF invoice.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice #</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Date</Label>
              <Input id="invoiceDate" value={format(new Date(), "PPP")} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client or Company Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientAddress">Client Address (Optional)</Label>
            <Input
              id="clientAddress"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Client Address"
            />
          </div>

          <div className="border rounded-md p-3 mt-2">
            <h4 className="font-medium mb-2">Invoice Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{selectedItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Hours:</span>
                <span>{totalHours.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateInvoice} disabled={!invoiceNumber || !clientName || isGenerating}>
            {isGenerating ? "Generating..." : "Generate Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
