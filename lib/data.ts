import type { Patient, Appointment, Invoice, InventoryItem, StaffMember, Branch, DashboardStats, Notification, Treatment } from "@/types"

export const mockBranches: Branch[] = [
  { id: "br1", name: "Main Clinic Downtown", address: "123 Medical Ave, Downtown", phone: "+1 (555) 123-4567", email: "downtown@dentalclinic.com", status: "active", createdAt: "2023-01-15" },
  { id: "br2", name: "Westside Dental Center", address: "456 Oak Street, Westside", phone: "+1 (555) 234-5678", email: "westside@dentalclinic.com", status: "active", createdAt: "2023-06-01" },
  { id: "br3", name: "Eastside Family Dental", address: "789 Pine Road, Eastside", phone: "+1 (555) 345-6789", email: "eastside@dentalclinic.com", status: "active", createdAt: "2024-02-10" },
]

export const mockPatients: Patient[] = [
  { id: "p1", name: "Sarah Johnson", gender: "female", dateOfBirth: "1985-03-15", phone: "+1 (555) 111-2222", email: "sarah.j@email.com", address: "100 Elm St", bloodGroup: "A+", allergies: ["Penicillin", "Latex"], insuranceProvider: "Delta Dental", insuranceNumber: "DEL-12345", vip: true, blacklisted: false, lastVisit: "2025-05-15", totalVisits: 24, totalSpent: 12450, tags: ["VIP", "Regular"], createdAt: "2023-02-10" },
  { id: "p2", name: "Michael Chen", gender: "male", dateOfBirth: "1990-07-22", phone: "+1 (555) 222-3333", email: "m.chen@email.com", address: "200 Maple Dr", bloodGroup: "O+", allergies: [], insuranceProvider: "Aetna", insuranceNumber: "AET-67890", vip: false, blacklisted: false, lastVisit: "2025-05-18", totalVisits: 8, totalSpent: 3200, tags: ["New"], createdAt: "2024-11-01" },
  { id: "p3", name: "Emily Rodriguez", gender: "female", dateOfBirth: "1978-11-08", phone: "+1 (555) 333-4444", email: "emily.r@email.com", address: "300 Birch Ln", bloodGroup: "B-", allergies: ["Sulfa"], vip: true, blacklisted: false, lastVisit: "2025-05-14", totalVisits: 31, totalSpent: 18700, tags: ["VIP", "Family"], createdAt: "2022-08-15" },
  { id: "p4", name: "James Wilson", gender: "male", dateOfBirth: "1965-01-30", phone: "+1 (555) 444-5555", email: "jwilson@email.com", address: "400 Cedar Ave", bloodGroup: "AB+", allergies: ["Aspirin"], insuranceProvider: "Cigna", insuranceNumber: "CIG-24680", vip: false, blacklisted: false, lastVisit: "2025-05-10", totalVisits: 15, totalSpent: 8900, tags: ["Senior"], createdAt: "2023-05-20" },
  { id: "p5", name: "Amara Okafor", gender: "female", dateOfBirth: "1995-09-12", phone: "+1 (555) 555-6666", email: "amara.o@email.com", address: "500 Walnut St", bloodGroup: "O-", allergies: [], vip: false, blacklisted: true, lastVisit: "2025-04-28", totalVisits: 3, totalSpent: 450, tags: ["Blacklisted"], createdAt: "2025-01-10" },
  { id: "p6", name: "David Kim", gender: "male", dateOfBirth: "1982-06-05", phone: "+1 (555) 666-7777", email: "david.kim@email.com", address: "600 Oak Ave", bloodGroup: "A-", allergies: ["Codeine"], insuranceProvider: "MetLife", insuranceNumber: "MET-13579", vip: false, blacklisted: false, lastVisit: "2025-05-20", totalVisits: 12, totalSpent: 5600, tags: ["Regular"], createdAt: "2023-09-01" },
  { id: "p7", name: "Sophia Martinez", gender: "female", dateOfBirth: "2000-12-25", phone: "+1 (555) 777-8888", email: "sophia.m@email.com", address: "700 Pine St", bloodGroup: "B+", allergies: ["Peanuts"], vip: false, blacklisted: false, lastVisit: "2025-05-12", totalVisits: 6, totalSpent: 2100, tags: [], createdAt: "2024-06-15" },
  { id: "p8", name: "Robert Taylor", gender: "male", dateOfBirth: "1970-04-18", phone: "+1 (555) 888-9999", email: "rtaylor@email.com", address: "800 Elm Dr", bloodGroup: "A+", allergies: [], insuranceProvider: "United Healthcare", insuranceNumber: "UHC-97531", vip: false, blacklisted: false, lastVisit: "2025-05-08", totalVisits: 19, totalSpent: 11200, tags: ["Senior", "Regular"], createdAt: "2022-11-20" },
]

export const mockAppointments: Appointment[] = [
  { id: "a1", patientId: "p1", patientName: "Sarah Johnson", dentistId: "d1", dentistName: "Dr. Emily White", branchId: "br1", date: "2025-05-21", startTime: "09:00", endTime: "09:30", type: "Check-up", status: "confirmed", chair: "Chair 1", room: "Room A" },
  { id: "a2", patientId: "p2", patientName: "Michael Chen", dentistId: "d2", dentistName: "Dr. James Lee", branchId: "br1", date: "2025-05-21", startTime: "09:30", endTime: "10:15", type: "Root Canal", status: "confirmed", chair: "Chair 2", room: "Room B" },
  { id: "a3", patientId: "p3", patientName: "Emily Rodriguez", dentistId: "d1", dentistName: "Dr. Emily White", branchId: "br1", date: "2025-05-21", startTime: "10:00", endTime: "10:30", type: "Cleaning", status: "waiting", chair: "Chair 1", room: "Room A" },
  { id: "a4", patientId: "p4", patientName: "James Wilson", dentistId: "d3", dentistName: "Dr. Sarah Park", branchId: "br2", date: "2025-05-21", startTime: "10:30", endTime: "11:30", type: "Crown", status: "booked", chair: "Chair 3", room: "Room C" },
  { id: "a5", patientId: "p6", patientName: "David Kim", dentistId: "d2", dentistName: "Dr. James Lee", branchId: "br1", date: "2025-05-21", startTime: "11:00", endTime: "11:30", type: "Check-up", status: "in_treatment", chair: "Chair 2", room: "Room B" },
  { id: "a6", patientId: "p7", patientName: "Sophia Martinez", dentistId: "d1", dentistName: "Dr. Emily White", branchId: "br1", date: "2025-05-21", startTime: "13:00", endTime: "13:45", type: "Filling", status: "booked", chair: "Chair 1", room: "Room A" },
  { id: "a7", patientId: "p8", patientName: "Robert Taylor", dentistId: "d3", dentistName: "Dr. Sarah Park", branchId: "br2", date: "2025-05-21", startTime: "14:00", endTime: "14:30", type: "Extraction", status: "booked", chair: "Chair 3", room: "Room C" },
  { id: "a8", patientId: "p4", patientName: "James Wilson", dentistId: "d2", dentistName: "Dr. James Lee", branchId: "br1", date: "2025-05-21", startTime: "15:00", endTime: "16:00", type: "Denture Fitting", status: "booked", chair: "Chair 2", room: "Room B" },
  { id: "a9", patientId: "p1", patientName: "Sarah Johnson", dentistId: "d1", dentistName: "Dr. Emily White", branchId: "br1", date: "2025-05-19", startTime: "09:00", endTime: "09:30", type: "Check-up", status: "completed" },
  { id: "a10", patientId: "p3", patientName: "Emily Rodriguez", dentistId: "d1", dentistName: "Dr. Emily White", branchId: "br1", date: "2025-05-19", startTime: "10:00", endTime: "10:45", type: "Deep Cleaning", status: "completed" },
  { id: "a11", patientId: "p5", patientName: "Amara Okafor", dentistId: "d2", dentistName: "Dr. James Lee", branchId: "br1", date: "2025-04-28", startTime: "11:00", endTime: "11:30", type: "Check-up", status: "no_show" },
  { id: "a12", patientId: "p2", patientName: "Michael Chen", dentistId: "d3", dentistName: "Dr. Sarah Park", branchId: "br2", date: "2025-05-22", startTime: "09:00", endTime: "09:30", type: "Follow-up", status: "booked" },
]

export const mockInvoices: Invoice[] = [
  { id: "inv1", patientId: "p1", patientName: "Sarah Johnson", invoiceNumber: "INV-2025-001", items: [{ id: "item1", description: "Comprehensive Dental Exam", quantity: 1, unitPrice: 150, total: 150 }, { id: "item2", description: "Teeth Cleaning", quantity: 1, unitPrice: 120, total: 120 }], subtotal: 270, discount: 20, tax: 25, total: 275, paid: 275, status: "paid", dueDate: "2025-05-15", createdAt: "2025-05-15" },
  { id: "inv2", patientId: "p2", patientName: "Michael Chen", invoiceNumber: "INV-2025-002", items: [{ id: "item3", description: "Root Canal Treatment", quantity: 1, unitPrice: 1200, total: 1200 }, { id: "item4", description: "Local Anesthesia", quantity: 2, unitPrice: 50, total: 100 }], subtotal: 1300, discount: 0, tax: 130, total: 1430, paid: 500, status: "partial", dueDate: "2025-06-01", createdAt: "2025-05-18" },
  { id: "inv3", patientId: "p3", patientName: "Emily Rodriguez", invoiceNumber: "INV-2025-003", items: [{ id: "item5", description: "Dental Crown", quantity: 1, unitPrice: 1500, total: 1500 }], subtotal: 1500, discount: 100, tax: 140, total: 1540, paid: 0, status: "pending", dueDate: "2025-06-10", createdAt: "2025-05-20" },
  { id: "inv4", patientId: "p6", patientName: "David Kim", invoiceNumber: "INV-2025-004", items: [{ id: "item6", description: "Check-up & X-rays", quantity: 1, unitPrice: 250, total: 250 }], subtotal: 250, discount: 0, tax: 25, total: 275, paid: 275, status: "paid", dueDate: "2025-05-10", createdAt: "2025-05-10" },
  { id: "inv5", patientId: "p8", patientName: "Robert Taylor", invoiceNumber: "INV-2025-005", items: [{ id: "item7", description: "Tooth Extraction", quantity: 1, unitPrice: 350, total: 350 }, { id: "item8", description: "Prescription", quantity: 1, unitPrice: 25, total: 25 }], subtotal: 375, discount: 0, tax: 37.5, total: 412.5, paid: 0, status: "overdue", dueDate: "2025-05-05", createdAt: "2025-04-28" },
]

export const mockInventory: InventoryItem[] = [
  { id: "inv1", name: "Surgical Gloves (Box)", category: "Consumables", sku: "GLV-001", quantity: 45, minQuantity: 20, unit: "box", unitPrice: 15, supplier: "MedSupply Co.", location: "Storage A", createdAt: "2025-01-10" },
  { id: "inv2", name: "Face Masks (Box)", category: "Consumables", sku: "MSK-001", quantity: 120, minQuantity: 50, unit: "box", unitPrice: 8, supplier: "MedSupply Co.", location: "Storage A", createdAt: "2025-01-10" },
  { id: "inv3", name: "Dental Resin", category: "Materials", sku: "RES-001", quantity: 8, minQuantity: 10, unit: "bottle", unitPrice: 85, supplier: "DentTech Inc.", expirationDate: "2026-03-01", batchNumber: "BATCH-2024-03", location: "Storage B", createdAt: "2025-02-15" },
  { id: "inv4", name: "Lidocaine Anesthetic", category: "Medications", sku: "ANE-001", quantity: 25, minQuantity: 15, unit: "vial", unitPrice: 12, supplier: "PharmaDirect", expirationDate: "2025-12-01", batchNumber: "BATCH-2024-06", location: "Refrigerator", createdAt: "2025-03-01" },
  { id: "inv5", name: "Dental Syringes", category: "Instruments", sku: "SYR-001", quantity: 50, minQuantity: 20, unit: "piece", unitPrice: 3, supplier: "DentTech Inc.", location: "Storage B", createdAt: "2025-01-10" },
  { id: "inv6", name: "Dental Implants (Titanium)", category: "Materials", sku: "IMP-001", quantity: 5, minQuantity: 10, unit: "piece", unitPrice: 250, supplier: "ImplantPro", batchNumber: "BATCH-2024-08", location: "Storage B", createdAt: "2025-04-01" },
  { id: "inv7", name: "X-Ray Film Pack", category: "Consumables", sku: "XRY-001", quantity: 3, minQuantity: 10, unit: "pack", unitPrice: 45, supplier: "MedSupply Co.", location: "Storage A", createdAt: "2025-01-10" },
  { id: "inv8", name: "Sterilization Pouches", category: "Consumables", sku: "STP-001", quantity: 200, minQuantity: 50, unit: "piece", unitPrice: 0.5, supplier: "SteriClean", location: "Storage A", createdAt: "2025-02-01" },
]

export const mockStaff: StaffMember[] = [
  { id: "d1", name: "Dr. Emily White", email: "emily.white@clinic.com", phone: "+1 (555) 101-2020", role: "dentist", department: "General Dentistry", salary: 180000, joinDate: "2022-03-01", status: "active", shift: "Morning", branchId: "br1" },
  { id: "d2", name: "Dr. James Lee", email: "james.lee@clinic.com", phone: "+1 (555) 202-3030", role: "dentist", department: "Endodontics", salary: 200000, joinDate: "2022-06-15", status: "active", shift: "Morning", branchId: "br1" },
  { id: "d3", name: "Dr. Sarah Park", email: "sarah.park@clinic.com", phone: "+1 (555) 303-4040", role: "dentist", department: "Oral Surgery", salary: 220000, joinDate: "2023-01-10", status: "active", shift: "Afternoon", branchId: "br2" },
  { id: "st1", name: "Lisa Thompson", email: "lisa.t@clinic.com", phone: "+1 (555) 404-5050", role: "receptionist", department: "Front Desk", salary: 45000, joinDate: "2023-04-01", status: "active", shift: "Morning", branchId: "br1" },
  { id: "st2", name: "Mark Davis", email: "mark.d@clinic.com", phone: "+1 (555) 505-6060", role: "assistant", department: "Nursing", salary: 52000, joinDate: "2023-05-15", status: "active", shift: "Morning", branchId: "br1" },
  { id: "st3", name: "Rachel Green", email: "rachel.g@clinic.com", phone: "+1 (555) 606-7070", role: "accountant", department: "Finance", salary: 65000, joinDate: "2022-09-01", status: "active", shift: "Morning", branchId: "br1" },
  { id: "st4", name: "Tom Martinez", email: "tom.m@clinic.com", phone: "+1 (555) 707-8080", role: "inventory_manager", department: "Logistics", salary: 55000, joinDate: "2024-02-01", status: "active", shift: "Afternoon", branchId: "br1" },
  { id: "st5", name: "Nancy Brown", email: "nancy.b@clinic.com", phone: "+1 (555) 808-9090", role: "hr_manager", department: "Human Resources", salary: 60000, joinDate: "2023-08-15", status: "active", shift: "Morning", branchId: "br1" },
  { id: "st6", name: "Dr. Kevin Adams", email: "kevin.a@clinic.com", phone: "+1 (555) 909-0101", role: "dentist", department: "Orthodontics", salary: 190000, joinDate: "2024-05-01", status: "on_leave", shift: "Afternoon", branchId: "br2" },
]

export const mockTreatments: Treatment[] = [
  { id: "t1", patientId: "p1", patientName: "Sarah Johnson", dentistId: "d1", dentistName: "Dr. Emily White", procedure: "Teeth Whitening", description: "Professional laser whitening treatment", status: "completed", cost: 500, date: "2025-05-15" },
  { id: "t2", patientId: "p2", patientName: "Michael Chen", dentistId: "d2", dentistName: "Dr. James Lee", procedure: "Root Canal", toothNumber: 14, description: "Root canal treatment on upper left first molar", status: "in_progress", cost: 1200, date: "2025-05-18" },
  { id: "t3", patientId: "p3", patientName: "Emily Rodriguez", dentistId: "d1", dentistName: "Dr. Emily White", procedure: "Dental Crown", toothNumber: 7, description: "Porcelain crown for upper right central incisor", status: "planned", cost: 1500, date: "2025-05-25" },
  { id: "t4", patientId: "p6", patientName: "David Kim", dentistId: "d2", dentistName: "Dr. James Lee", procedure: "Scaling & Root Planing", description: "Deep cleaning for periodontal disease", status: "follow_up", cost: 800, date: "2025-05-10" },
  { id: "t5", patientId: "p8", patientName: "Robert Taylor", dentistId: "d3", dentistName: "Dr. Sarah Park", procedure: "Tooth Extraction", toothNumber: 18, description: "Surgical extraction of impacted wisdom tooth", status: "in_progress", cost: 350, date: "2025-05-20" },
]

export const mockNotifications: Notification[] = [
  { id: "n1", title: "New Patient Registered", message: "Amara Okafor has registered as a new patient", type: "info", read: false, createdAt: "2025-05-21T08:30:00" },
  { id: "n2", title: "Low Stock Alert", message: "Dental Implants (Titanium) is below minimum quantity", type: "warning", read: false, createdAt: "2025-05-21T07:00:00" },
  { id: "n3", title: "Payment Received", message: "Sarah Johnson paid invoice INV-2025-001 - $275.00", type: "success", read: false, createdAt: "2025-05-20T16:30:00" },
  { id: "n4", title: "Appointment No-Show", message: "Amara Okafor missed their appointment", type: "error", read: true, createdAt: "2025-05-20T11:30:00" },
  { id: "n5", title: "Staff Leave Request", message: "Dr. Kevin Adams requested annual leave", type: "info", read: true, createdAt: "2025-05-20T09:15:00" },
]

export function getDashboardStats(): DashboardStats {
  return {
    todaysAppointments: mockAppointments.filter(a => a.date === "2025-05-21").length,
    waitingPatients: mockAppointments.filter(a => a.status === "waiting").length,
    activeTreatments: mockTreatments.filter(t => t.status === "in_progress").length,
    revenueToday: 4850,
    monthlyEarnings: 84750,
    pendingPayments: mockInvoices.filter(i => i.status === "pending" || i.status === "overdue").reduce((sum, i) => sum + i.total - i.paid, 0),
    lowStockItems: mockInventory.filter(i => i.quantity <= i.minQuantity).length,
    staffOnDuty: mockStaff.filter(s => s.status === "active").length,
    totalPatients: mockPatients.length,
    appointmentChange: 12,
    revenueChange: 8.5,
    patientChange: 5.2,
  }
}

export function getMonthlyRevenue() {
  return [
    { month: "Jan", revenue: 52000, expenses: 38000 },
    { month: "Feb", revenue: 48000, expenses: 35000 },
    { month: "Mar", revenue: 58000, expenses: 40000 },
    { month: "Apr", revenue: 62000, expenses: 42000 },
    { month: "May", revenue: 75000, expenses: 48000 },
    { month: "Jun", revenue: 70000, expenses: 45000 },
    { month: "Jul", revenue: 68000, expenses: 44000 },
    { month: "Aug", revenue: 72000, expenses: 46000 },
    { month: "Sep", revenue: 78000, expenses: 50000 },
    { month: "Oct", revenue: 82000, expenses: 52000 },
    { month: "Nov", revenue: 79000, expenses: 51000 },
    { month: "Dec", revenue: 84750, expenses: 53000 },
  ]
}
