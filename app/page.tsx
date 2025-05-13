"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TimeEntryForm from "@/components/time-entry-form"
import UnbilledItems from "@/components/unbilled-items"
import InvoicesList from "@/components/invoices-list"
import UserSettingsDialog from "@/components/user-settings-dialog"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { loadFromStorage } from "@/lib/storage"
import type { UserSettings, TimeEntry, Invoice } from "@/lib/types"

export default function Home() {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: "",
    address: "",
    hourlyRate: 0,
  })
  const [unbilledItems, setUnbilledItems] = useState<TimeEntry[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    // Load data from localStorage on initial render
    const settings = loadFromStorage<UserSettings>("userSettings", {
      name: "",
      address: "",
      hourlyRate: 0,
    })
    const items = loadFromStorage<TimeEntry[]>("unbilledItems", [])
    const savedInvoices = loadFromStorage<Invoice[]>("invoices", [])

    setUserSettings(settings)
    setUnbilledItems(items)
    setInvoices(savedInvoices)

    // Show settings dialog if user hasn't set them yet
    if (!settings.name) {
      setIsSettingsOpen(true)
    }
  }, [])

  const handleAddTimeEntry = (entry: TimeEntry) => {
    const updatedItems = [...unbilledItems, entry]
    setUnbilledItems(updatedItems)
    localStorage.setItem("unbilledItems", JSON.stringify(updatedItems))
  }

  const handleUpdateSettings = (settings: UserSettings) => {
    setUserSettings(settings)
    localStorage.setItem("userSettings", JSON.stringify(settings))
    setIsSettingsOpen(false)
  }

  const handleCreateInvoice = (newInvoice: Invoice, itemsToRemove: TimeEntry[]) => {
    // Add new invoice
    const updatedInvoices = [...invoices, newInvoice]
    setInvoices(updatedInvoices)
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices))

    // Remove billed items from unbilled list
    const remainingItems = unbilledItems.filter(
      (item) => !itemsToRemove.some((removeItem) => removeItem.id === item.id),
    )
    setUnbilledItems(remainingItems)
    localStorage.setItem("unbilledItems", JSON.stringify(remainingItems))
  }

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Freelance Tracker</h1>
        <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="time-entry" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="time-entry">Time Entry</TabsTrigger>
          <TabsTrigger value="unbilled">Unbilled Items</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="time-entry">
          <TimeEntryForm onAddEntry={handleAddTimeEntry} />
        </TabsContent>

        <TabsContent value="unbilled">
          <UnbilledItems items={unbilledItems} userSettings={userSettings} onCreateInvoice={handleCreateInvoice} />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesList invoices={invoices} userSettings={userSettings} />
        </TabsContent>
      </Tabs>

      <UserSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSave={handleUpdateSettings}
      />
    </main>
  )
}
