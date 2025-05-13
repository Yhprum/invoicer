"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Invoice, TimeEntry, UserSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import CreateInvoiceDialog from "./create-invoice-dialog";

interface UnbilledItemsProps {
  items: TimeEntry[];
  userSettings: UserSettings;
  onCreateInvoice: (invoice: Invoice, items: TimeEntry[]) => void;
}

export default function UnbilledItems({ items, userSettings, onCreateInvoice }: UnbilledItemsProps) {
  const [selectedItems, setSelectedItems] = useState<TimeEntry[]>([]);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  const toggleItemSelection = (item: TimeEntry) => {
    if (selectedItems.some((selected) => selected.id === item.id)) {
      setSelectedItems(selectedItems.filter((selected) => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const totalHours = selectedItems.reduce((sum, item) => sum + item.hours, 0);
  const totalAmount = totalHours * userSettings.hourlyRate;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Unbilled Work</CardTitle>
          <CardDescription>Select items to include in a new invoice</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No unbilled items yet. Add time entries to get started.</div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 rounded-md border">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={selectedItems.some((selected) => selected.id === item.id)}
                      onCheckedChange={() => toggleItemSelection(item)}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">{format(parseISO(item.date), "MMM d, yyyy")}</div>
                        <div>
                          {item.hours} {item.hours === 1 ? "hour" : "hours"}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Selected:</span>
                  <span>
                    {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Hours:</span>
                  <span>{totalHours.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium mt-1">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <Button className="w-full mt-4" disabled={selectedItems.length === 0} onClick={() => setIsCreateInvoiceOpen(true)}>
                  Create Invoice
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateInvoiceDialog
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        selectedItems={selectedItems}
        userSettings={userSettings}
        onCreateInvoice={onCreateInvoice}
      />
    </>
  );
}
