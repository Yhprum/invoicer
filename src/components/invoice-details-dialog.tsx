"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Invoice, UserSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Download } from "lucide-react";

interface InvoiceDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  userSettings: UserSettings;
  onTogglePaid: () => void;
  onDownload: () => void;
}

export default function InvoiceDetailsDialog({
  isOpen,
  onClose,
  invoice,
  userSettings,
  onTogglePaid,
  onDownload,
}: InvoiceDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Invoice #{invoice.number}
            <Badge variant={invoice.isPaid ? "default" : "secondary"}>{invoice.isPaid ? "Paid" : "Unpaid"}</Badge>
          </DialogTitle>
          <DialogDescription>Created on {format(parseISO(invoice.date), "MMMM d, yyyy")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">From</h4>
              <div className="text-sm">{userSettings.name}</div>
              <div className="text-sm whitespace-pre-line">{userSettings.address}</div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">To</h4>
              <div className="text-sm">{invoice.clientName}</div>
              <div className="text-sm whitespace-pre-line">{invoice.clientAddress}</div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Hours</th>
                  <th className="p-2 text-right">Rate</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">{format(parseISO(item.date), "MMM d, yyyy")}</td>
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-right">{item.hours.toFixed(2)}</td>
                    <td className="p-2 text-right">{formatCurrency(userSettings.hourlyRate)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.hours * userSettings.hourlyRate)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 font-medium">
                <tr className="border-t">
                  <td colSpan={3} className="p-2 text-right">
                    Total Hours:
                  </td>
                  <td colSpan={2} className="p-2 text-right">
                    {invoice.totalHours.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-2 text-right">
                    Total Amount:
                  </td>
                  <td colSpan={2} className="p-2 text-right">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant={invoice.isPaid ? "outline" : "default"} onClick={onTogglePaid}>
            Mark as {invoice.isPaid ? "Unpaid" : "Paid"}
          </Button>
          <Button variant="outline" onClick={onDownload} className="flex items-center gap-1">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
