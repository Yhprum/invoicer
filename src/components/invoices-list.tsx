"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateInvoicePdf } from "@/lib/pdf-generator";
import type { Invoice, UserSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Download, Eye } from "lucide-react";
import { useState } from "react";
import InvoiceDetailsDialog from "./invoice-details-dialog";

interface InvoicesListProps {
  invoices: Invoice[];
  userSettings: UserSettings;
}

export default function InvoicesList({ invoices, userSettings }: InvoicesListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      await generateInvoicePdf(invoice, userSettings);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  const togglePaidStatus = (invoice: Invoice) => {
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === invoice.id) {
        return { ...inv, isPaid: !inv.isPaid };
      }
      return inv;
    });

    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));

    // Force re-render by updating the selected invoice if it's the one being toggled
    if (selectedInvoice && selectedInvoice.id === invoice.id) {
      setSelectedInvoice({ ...selectedInvoice, isPaid: !selectedInvoice.isPaid });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>View and manage your invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices created yet. Create your first invoice from the Unbilled Items tab.
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Invoice #{invoice.number}</h3>
                      <Badge variant={invoice.isPaid ? "default" : "secondary"}>{invoice.isPaid ? "Paid" : "Unpaid"}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(invoice.date), "MMM d, yyyy")} • {invoice.clientName}
                    </div>
                    <div className="text-sm font-medium mt-1">{formatCurrency(invoice.totalAmount)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleViewInvoice(invoice)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDownloadInvoice(invoice)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInvoice && (
        <InvoiceDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          invoice={selectedInvoice}
          userSettings={userSettings}
          onTogglePaid={() => togglePaidStatus(selectedInvoice)}
          onDownload={() => handleDownloadInvoice(selectedInvoice)}
        />
      )}
    </>
  );
}
