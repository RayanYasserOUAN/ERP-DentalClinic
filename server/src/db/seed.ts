import bcrypt from "bcryptjs"
import { pool, query } from "./pool"

async function seed() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const passwordHash = await bcrypt.hash("password", 12)

    // Branches
    const branches = await client.query(`
      INSERT INTO branches (name, address, phone, email) VALUES
        ('Main Clinic Downtown', '123 Medical Ave, Downtown', '+1 (555) 123-4567', 'downtown@dentflow.com'),
        ('Westside Dental Center', '456 Oak Street, Westside', '+1 (555) 234-5678', 'westside@dentflow.com'),
        ('Eastside Family Dental', '789 Pine Road, Eastside', '+1 (555) 345-6789', 'eastside@dentflow.com')
      RETURNING id, name
    `)

    const branchMap: Record<string, string> = {}
    branches.rows.forEach((b: { id: string; name: string }) => {
      if (b.name.includes("Main")) branchMap.main = b.id
      else if (b.name.includes("Westside")) branchMap.west = b.id
      else branchMap.east = b.id
    })

    const roleMap: Record<string, string> = {}
    const roles = await client.query("SELECT id, name FROM roles")
    roles.rows.forEach((r: { id: string; name: string }) => {
      roleMap[r.name] = r.id
    })

    // Users
    const users = await client.query(`
      INSERT INTO users (name, email, password_hash, role_id, branch_id, phone, department, salary, shift, join_date, status) VALUES
        ('Super Admin', 'admin@dentflow.com', $1, $2, $3, '+1 (555) 000-0000', 'Administration', 250000, 'Morning', '2022-01-01', 'active'),
        ('Dr. Emily White', 'emily.white@dentflow.com', $1, $4, $3, '+1 (555) 101-2020', 'General Dentistry', 180000, 'Morning', '2022-03-01', 'active'),
        ('Dr. James Lee', 'james.lee@dentflow.com', $1, $4, $3, '+1 (555) 202-3030', 'Endodontics', 200000, 'Morning', '2022-06-15', 'active'),
        ('Dr. Sarah Park', 'sarah.park@dentflow.com', $1, $4, $5, '+1 (555) 303-4040', 'Oral Surgery', 220000, 'Afternoon', '2023-01-10', 'active'),
        ('Lisa Thompson', 'lisa.t@dentflow.com', $1, $6, $3, '+1 (555) 404-5050', 'Front Desk', 45000, 'Morning', '2023-04-01', 'active'),
        ('Mark Davis', 'mark.d@dentflow.com', $1, $7, $3, '+1 (555) 505-6060', 'Nursing', 52000, 'Morning', '2023-05-15', 'active'),
        ('Rachel Green', 'rachel.g@dentflow.com', $1, $8, $3, '+1 (555) 606-7070', 'Finance', 65000, 'Morning', '2022-09-01', 'active'),
        ('Tom Martinez', 'tom.m@dentflow.com', $1, $9, $3, '+1 (555) 707-8080', 'Logistics', 55000, 'Afternoon', '2024-02-01', 'active'),
        ('Nancy Brown', 'nancy.b@dentflow.com', $1, $10, $3, '+1 (555) 808-9090', 'Human Resources', 60000, 'Morning', '2023-08-15', 'active'),
        ('Dr. Kevin Adams', 'kevin.a@dentflow.com', $1, $4, $5, '+1 (555) 909-0101', 'Orthodontics', 190000, 'Afternoon', '2024-05-01', 'on_leave')
      RETURNING id, name, email
    `, [passwordHash, roleMap.super_admin, branchMap.main, roleMap.dentist, branchMap.west, roleMap.receptionist, roleMap.assistant, roleMap.accountant, roleMap.inventory_manager, roleMap.hr_manager])

    const userMap: Record<string, string> = {}
    users.rows.forEach((u: { id: string; name: string }) => {
      if (u.name.includes("Emily White")) userMap.emily = u.id
      else if (u.name.includes("James Lee")) userMap.james = u.id
      else if (u.name.includes("Sarah Park")) userMap.sarah = u.id
    })

    // Procedures
    await client.query(`
      INSERT INTO procedures (name, description, category, default_price, duration_minutes) VALUES
        ('Comprehensive Dental Exam', 'Full dental examination', 'Examination', 150, 30),
        ('Teeth Cleaning', 'Professional teeth cleaning', 'Preventive', 120, 30),
        ('Root Canal', 'Root canal treatment', 'Endodontics', 1200, 90),
        ('Dental Crown', 'Porcelain dental crown', 'Restorative', 1500, 60),
        ('Tooth Extraction', 'Tooth extraction procedure', 'Oral Surgery', 350, 30),
        ('Teeth Whitening', 'Professional laser whitening', 'Cosmetic', 500, 45),
        ('Filling', 'Dental filling procedure', 'Restorative', 200, 30),
        ('Deep Cleaning', 'Scaling and root planing', 'Periodontics', 400, 60),
        ('Denture Fitting', 'Complete denture fitting', 'Prosthodontics', 2500, 90),
        ('Follow-up', 'Standard follow-up appointment', 'General', 75, 15)
    `)

    // Patients
    const patients = await client.query(`
      INSERT INTO patients (name, gender, date_of_birth, phone, email, address, blood_group, allergies, insurance_provider, insurance_number, vip, blacklisted, tags, branch_id) VALUES
        ('Sarah Johnson', 'female', '1985-03-15', '+1 (555) 111-2222', 'sarah.j@email.com', '100 Elm St', 'A+', $1, 'Delta Dental', 'DEL-12345', true, false, $2, $3),
        ('Michael Chen', 'male', '1990-07-22', '+1 (555) 222-3333', 'm.chen@email.com', '200 Maple Dr', 'O+', $4, 'Aetna', 'AET-67890', false, false, $5, $3),
        ('Emily Rodriguez', 'female', '1978-11-08', '+1 (555) 333-4444', 'emily.r@email.com', '300 Birch Ln', 'B-', $6, null, null, true, false, $7, $3),
        ('James Wilson', 'male', '1965-01-30', '+1 (555) 444-5555', 'jwilson@email.com', '400 Cedar Ave', 'AB+', $8, 'Cigna', 'CIG-24680', false, false, $9, $5),
        ('Amara Okafor', 'female', '1995-09-12', '+1 (555) 555-6666', 'amara.o@email.com', '500 Walnut St', 'O-', $4, null, null, false, true, $10, $3),
        ('David Kim', 'male', '1982-06-05', '+1 (555) 666-7777', 'david.kim@email.com', '600 Oak Ave', 'A-', $11, 'MetLife', 'MET-13579', false, false, $12, $3),
        ('Sophia Martinez', 'female', '2000-12-25', '+1 (555) 777-8888', 'sophia.m@email.com', '700 Pine St', 'B+', $13, null, null, false, false, $4, $3),
        ('Robert Taylor', 'male', '1970-04-18', '+1 (555) 888-9999', 'rtaylor@email.com', '800 Elm Dr', 'A+', $4, 'United Healthcare', 'UHC-97531', false, false, $14, $5)
      RETURNING id
    `, [
      '{Penicillin, Latex}', '{VIP, Regular}', branchMap.main,
      '{}', '{New}', '{Sulfa}',
      '{VIP, Family}', '{Aspirin}', '{Senior}',
      '{Blacklisted}', '{Codeine}', '{Regular}',
      '{Peanuts}', '{Senior, Regular}'
    ])

    // Appointments
    const patientIds = patients.rows.map((r: { id: string }) => r.id)
    await client.query(`
      INSERT INTO appointments (patient_id, dentist_id, branch_id, date, start_time, end_time, type, status, chair, room) VALUES
        ($1, $2, $3, '2026-05-22', '09:00', '09:30', 'Check-up', 'confirmed', 'Chair 1', 'Room A'),
        ($4, $5, $3, '2026-05-22', '09:30', '10:15', 'Root Canal', 'confirmed', 'Chair 2', 'Room B'),
        ($6, $2, $3, '2026-05-22', '10:00', '10:30', 'Cleaning', 'waiting', 'Chair 1', 'Room A'),
        ($7, $8, $5, '2026-05-22', '10:30', '11:30', 'Crown', 'booked', 'Chair 3', 'Room C'),
        ($9, $5, $3, '2026-05-22', '11:00', '11:30', 'Check-up', 'in_treatment', 'Chair 2', 'Room B'),
        ($10, $2, $3, '2026-05-22', '13:00', '13:45', 'Filling', 'booked', 'Chair 1', 'Room A'),
        ($11, $8, $5, '2026-05-22', '14:00', '14:30', 'Extraction', 'booked', 'Chair 3', 'Room C'),
        ($7, $5, $3, '2026-05-22', '15:00', '16:00', 'Denture Fitting', 'booked', 'Chair 2', 'Room B'),
        ($1, $2, $3, '2026-05-20', '09:00', '09:30', 'Check-up', 'completed'),
        ($6, $2, $3, '2026-05-20', '10:00', '10:45', 'Deep Cleaning', 'completed'),
        ($12, $5, $3, '2026-04-28', '11:00', '11:30', 'Check-up', 'no_show'),
        ($4, $8, $5, '2026-05-23', '09:00', '09:30', 'Follow-up', 'booked')
    `, [
      patientIds[0], userMap.emily, branchMap.main,
      patientIds[1], userMap.james, patientIds[2],
      patientIds[3], userMap.sarah, patientIds[4],
      patientIds[5], patientIds[6], patientIds[7],
    ])

    // Treatments
    await client.query(`
      INSERT INTO treatments (patient_id, dentist_id, procedure_name, tooth_number, description, status, cost, date) VALUES
        ($1, $2, 'Teeth Whitening', null, 'Professional laser whitening treatment', 'completed', 500, '2026-05-15'),
        ($3, $4, 'Root Canal', 14, 'Root canal treatment on upper left first molar', 'in_progress', 1200, '2026-05-18'),
        ($5, $2, 'Dental Crown', 7, 'Porcelain crown for upper right central incisor', 'planned', 1500, '2026-05-25'),
        ($6, $4, 'Scaling & Root Planing', null, 'Deep cleaning for periodontal disease', 'follow_up', 800, '2026-05-10'),
        ($7, $8, 'Tooth Extraction', 18, 'Surgical extraction of impacted wisdom tooth', 'in_progress', 350, '2026-05-20')
    `, [
      patientIds[0], userMap.emily,
      patientIds[1], userMap.james,
      patientIds[2], userMap.emily,
      patientIds[5], userMap.james,
      patientIds[7], userMap.sarah,
    ])

    // Invoices
    const invoices = await client.query(`
      INSERT INTO invoices (patient_id, invoice_number, subtotal, discount, tax, total, paid, status, due_date) VALUES
        ($1, 'INV-2026-001', 270, 20, 25, 275, 275, 'paid', '2026-05-15'),
        ($2, 'INV-2026-002', 1300, 0, 130, 1430, 500, 'partial', '2026-06-01'),
        ($3, 'INV-2026-003', 1500, 100, 140, 1540, 0, 'pending', '2026-06-10'),
        ($4, 'INV-2026-004', 250, 0, 25, 275, 275, 'paid', '2026-05-10'),
        ($5, 'INV-2026-005', 375, 0, 37.5, 412.5, 0, 'overdue', '2026-05-05')
      RETURNING id
    `, [patientIds[0], patientIds[1], patientIds[2], patientIds[5], patientIds[7]])

    // Invoice items
    const invIds = invoices.rows.map((r: { id: string }) => r.id)
    await client.query(`
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
        ($1, 'Comprehensive Dental Exam', 1, 150, 150),
        ($1, 'Teeth Cleaning', 1, 120, 120),
        ($2, 'Root Canal Treatment', 1, 1200, 1200),
        ($2, 'Local Anesthesia', 2, 50, 100),
        ($3, 'Dental Crown', 1, 1500, 1500),
        ($4, 'Check-up & X-rays', 1, 250, 250),
        ($5, 'Tooth Extraction', 1, 350, 350),
        ($5, 'Prescription', 1, 25, 25)
    `, invIds)

    // Suppliers
    await client.query(`
      INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
        ('MedSupply Co.', 'John Smith', '+1 (555) 111-0001', 'orders@medsupply.com', '100 Industrial Blvd'),
        ('DentTech Inc.', 'Sarah Wilson', '+1 (555) 111-0002', 'sales@denttech.com', '200 Tech Park Dr'),
        ('PharmaDirect', 'Mike Johnson', '+1 (555) 111-0003', 'orders@pharmadirect.com', '300 Pharma Ln'),
        ('ImplantPro', 'Lisa Chen', '+1 (555) 111-0004', 'info@implantpro.com', '400 Med Center Rd'),
        ('SteriClean', 'Tom Brown', '+1 (555) 111-0005', 'sales@stericlean.com', '500 Sanitary Ave')
    `)

    // Inventory items
    await client.query(`
      INSERT INTO inventory_items (name, category, sku, quantity, min_quantity, unit, unit_price, supplier_name, expiration_date, batch_number, location, branch_id) VALUES
        ('Surgical Gloves (Box)', 'Consumables', 'GLV-001', 45, 20, 'box', 15, 'MedSupply Co.', null, null, 'Storage A', $1),
        ('Face Masks (Box)', 'Consumables', 'MSK-001', 120, 50, 'box', 8, 'MedSupply Co.', null, null, 'Storage A', $1),
        ('Dental Resin', 'Materials', 'RES-001', 8, 10, 'bottle', 85, 'DentTech Inc.', '2027-03-01', 'BATCH-2025-03', 'Storage B', $1),
        ('Lidocaine Anesthetic', 'Medications', 'ANE-001', 25, 15, 'vial', 12, 'PharmaDirect', '2026-12-01', 'BATCH-2025-06', 'Refrigerator', $1),
        ('Dental Syringes', 'Instruments', 'SYR-001', 50, 20, 'piece', 3, 'DentTech Inc.', null, null, 'Storage B', $1),
        ('Dental Implants (Titanium)', 'Materials', 'IMP-001', 5, 10, 'piece', 250, 'ImplantPro', null, 'BATCH-2025-08', 'Storage B', $1),
        ('X-Ray Film Pack', 'Consumables', 'XRY-001', 3, 10, 'pack', 45, 'MedSupply Co.', null, null, 'Storage A', $1),
        ('Sterilization Pouches', 'Consumables', 'STP-001', 200, 50, 'piece', 0.5, 'SteriClean', null, null, 'Storage A', $1)
    `, [branchMap.main])

    // Notifications
    await client.query(`
      INSERT INTO notifications (user_id, title, message, type) VALUES
        ($1, 'Welcome to DentFlow', 'Your account has been created successfully.', 'success'),
        ($1, 'Low Stock Alert', 'Dental Implants (Titanium) is below minimum quantity.', 'warning'),
        ($1, 'Payment Received', 'Sarah Johnson paid invoice INV-2026-001 - $275.00', 'success'),
        ($1, 'Appointment No-Show', 'Amara Okafor missed their appointment.', 'error'),
        ($1, 'Staff Leave Request', 'Dr. Kevin Adams requested annual leave.', 'info')
    `, [users.rows[0].id])

    await client.query("COMMIT")
    console.log("Seed data inserted successfully!")
    console.log("\nDemo login credentials:")
    console.log("  Super Admin: admin@dentflow.com / password")
    console.log("  Dentist:     emily.white@dentflow.com / password")
    console.log("  Receptionist: lisa.t@dentflow.com / password")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Seed failed:", error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
