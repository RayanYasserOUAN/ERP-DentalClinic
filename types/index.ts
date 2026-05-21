export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  branchId: string
  active: boolean
}

export type Role =
  | "super_admin"
  | "clinic_owner"
  | "branch_manager"
  | "dentist"
  | "assistant"
  | "receptionist"
  | "accountant"
  | "inventory_manager"
  | "hr_manager"
  | "patient"

export interface Patient {
  id: string
  name: string
  gender: "male" | "female"
  dateOfBirth: string
  phone: string
  email: string
  address: string
  bloodGroup: string
  allergies: string[]
  insuranceProvider?: string
  insuranceNumber?: string
  avatar?: string
  vip: boolean
  blacklisted: boolean
  lastVisit?: string
  totalVisits: number
  totalSpent: number
  tags: string[]
  notes?: string
  createdAt: string
}

export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "waiting"
  | "in_treatment"
  | "completed"
  | "cancelled"
  | "no_show"

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientAvatar?: string
  dentistId: string
  dentistName: string
  branchId: string
  date: string
  startTime: string
  endTime: string
  type: string
  status: AppointmentStatus
  notes?: string
  chair?: string
  room?: string
  createdAt?: string
}

export type InvoiceStatus = "draft" | "pending" | "paid" | "partial" | "overdue" | "cancelled"

export interface Invoice {
  id: string
  patientId: string
  patientName: string
  invoiceNumber: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paid: number
  status: InvoiceStatus
  dueDate: string
  createdAt: string
  notes?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  sku: string
  quantity: number
  minQuantity: number
  unit: string
  unitPrice: number
  supplier?: string
  expirationDate?: string
  batchNumber?: string
  location?: string
  image?: string
  createdAt: string
}

export interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  department: string
  avatar?: string
  salary: number
  joinDate: string
  status: "active" | "on_leave" | "terminated"
  shift?: string
  branchId: string
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Treatment {
  id: string
  patientId: string
  patientName: string
  dentistId: string
  dentistName: string
  procedure: string
  toothNumber?: number
  description: string
  status: "planned" | "in_progress" | "completed" | "follow_up" | "referred"
  cost: number
  date: string
  notes?: string
}

export interface DashboardStats {
  todaysAppointments: number
  waitingPatients: number
  activeTreatments: number
  revenueToday: number
  monthlyEarnings: number
  pendingPayments: number
  lowStockItems: number
  staffOnDuty: number
  totalPatients: number
  appointmentChange: number
  revenueChange: number
  patientChange: number
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  read: boolean
  createdAt: string
}
