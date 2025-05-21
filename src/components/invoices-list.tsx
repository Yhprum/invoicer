"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateInvoicePdf } from "@/lib/pdf-generator";
import type { Invoice, UserSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format, isBefore, parseISO, startOfYear, subDays } from "date-fns";
import { Download, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import InvoiceDetailsDialog from "./invoice-details-dialog";

interface InvoicesListProps {
  invoices: Invoice[];
  userSettings: UserSettings;
}

export default function InvoicesList({ invoices, userSettings }: InvoicesListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filter, setFilter] = useState("ytd");

  const filteredInvoices = useMemo(() => {
    const minDate =
      filter === "ytd"
        ? startOfYear(new Date())
        : filter === "30d"
        ? subDays(new Date(), 30)
        : filter === "90d"
        ? subDays(new Date(), 90)
        : null;
    return minDate
      ? invoices.filter((invoice) => {
          const invoiceDate = parseISO(invoice.date);
          return !isBefore(invoiceDate, minDate);
        })
      : invoices;
  }, [invoices, filter]);

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

  const totalHours = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalHours, 0);
  const totalAmount = totalHours * userSettings.hourlyRate;
  const totalPaid = filteredInvoices.filter((invoice) => invoice.isPaid).reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>View and manage your invoice history</CardDescription>
          </div>
          <Select onValueChange={setFilter} defaultValue={filter}>
            <SelectTrigger>
              <SelectValue placeholder="Select a filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No invoices found for the selected period.</div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
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

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total Hours:</span>
                  <span>{totalHours.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium mt-1">
                  <span>Total Billed:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between font-medium mt-1">
                  <span>Total Paid:</span>
                  <span>{formatCurrency(totalPaid)}</span>
                </div>
              </div>
            </>
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
