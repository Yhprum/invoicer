"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { TimeEntry } from "@/lib/types"

interface TimeEntryFormProps {
  onAddEntry: (entry: TimeEntry) => void
}

export default function TimeEntryForm({ onAddEntry }: TimeEntryFormProps) {
  const today = new Date()
  const [date, setDate] = useState<Date>(today)
  const [description, setDescription] = useState("")
  const [hours, setHours] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !hours || Number.parseFloat(hours) < 0) {
      return
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      date: date.toISOString(),
      description,
      hours: Number.parseFloat(hours),
      createdAt: new Date().toISOString(),
    }

    onAddEntry(newEntry)

    // Reset form
    setDate(today)
    setDescription("")
    setHours("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Your Hours</CardTitle>
        <CardDescription>Enter the details of your work to track your time</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the work you did"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours</Label>
            <Input
              id="hours"
              type="number"
              step="0.25"
              min="0"
              placeholder="Number of hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Add Time Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
