"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import type { UserSettings } from "@/lib/types"

interface UserSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  settings: UserSettings
  onSave: (settings: UserSettings) => void
}

export default function UserSettingsDialog({ isOpen, onClose, settings, onSave }: UserSettingsDialogProps) {
  const [name, setName] = useState(settings.name)
  const [address, setAddress] = useState(settings.address)
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate.toString())

  // Update local state when props change
  useEffect(() => {
    setName(settings.name)
    setAddress(settings.address)
    setHourlyRate(settings.hourlyRate ? settings.hourlyRate.toString() : "")
  }, [settings, isOpen])

  const handleSave = () => {
    const rate = Number.parseFloat(hourlyRate)
    if (isNaN(rate) || rate <= 0) {
      return
    }

    onSave({
      name,
      address,
      hourlyRate: rate,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Your Information</DialogTitle>
          <DialogDescription>Set your personal details for invoices</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or business name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Your Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Your hourly rate"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
