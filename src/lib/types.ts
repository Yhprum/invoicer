export interface UserSettings {
  name: string;
  address: string;
  hourlyRate: number;
}

export interface TimeEntry {
  id: string;
  date: string;
  description: string;
  hours: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  clientName: string;
  clientAddress: string;
  items: TimeEntry[];
  totalHours: number;
  totalAmount: number;
  isPaid: boolean;
  createdAt: string;
}
