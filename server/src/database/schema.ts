import { pgTable, varchar, text, timestamp, boolean, decimal, integer, json, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Tabla de usuarios/propietarios
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone_number: varchar('phone_number', { length: 20 }),
  subscriptionPlan: varchar('subscription_plan', { length: 20 }).notNull().default('basic'), // basic, standard, premium
  subscriptionStatus: varchar('subscription_status', { length: 20 }).notNull().default('active'), // active, canceled, expired
  subscriptionStartDate: timestamp('subscription_start_date').defaultNow(),
  subscriptionEndDate: timestamp('subscription_end_date'),
  maxProperties: integer('max_properties').notNull().default(3),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de propiedades
export const properties = pgTable('properties', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }).notNull(),
  propertyType: varchar('property_type', { length: 50 }).notNull(), // apartment, house, room, etc.
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  squareMeters: decimal('square_meters', { precision: 8, scale: 2 }),
  description: text('description'),
  amenities: json('amenities'), // JSON array de amenidades
  images: json('images'), // JSON array de URLs de imágenes
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de inquilinos/arrendatarios
export const renters = pgTable('renters', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  dniNumber: varchar('dni_number', { length: 50 }), // Cédula, DNI, etc.
  emergencyContact: json('emergency_contact'), // {name, phone, relationship}
  verificationStatus: varchar('verification_status', { length: 20 }).default('pending'), // pending, verified, rejected
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de contratos/arriendos
export const leases = pgTable('leases', {
  id: varchar('id', { length: 36 }).primaryKey(),
  propertyId: varchar('property_id', { length: 36 }).references(() => properties.id).notNull(),
  renterId: varchar('renter_id', { length: 36 }).references(() => renters.id).notNull(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  leaseNumber: varchar('lease_number', { length: 50 }).unique(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  monthlyRent: decimal('monthly_rent', { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal('security_deposit', { precision: 10, scale: 2 }),
  paymentDueDay: integer('payment_due_day').notNull().default(1), // Día del mes para pago
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, expired, terminated
  contractFile: varchar('contract_file', { length: 500 }), // URL del contrato
  terms: text('terms'), // Términos específicos del contrato
  autoRenew: boolean('auto_renew').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de pagos
export const payments = pgTable('payments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  leaseId: varchar('lease_id', { length: 36 }).references(() => leases.id).notNull(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: date('due_date').notNull(),
  paidDate: date('paid_date'),
  paymentMethod: varchar('payment_method', { length: 50 }), // cash, transfer, check, etc.
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, paid, overdue, partial
  reference: varchar('reference', { length: 100 }), // Número de referencia del pago
  receiptFile: varchar('receipt_file', { length: 500 }), // URL del comprobante
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de recordatorios de pago
export const paymentReminders = pgTable('payment_reminders', {
  id: varchar('id', { length: 36 }).primaryKey(),
  paymentId: varchar('payment_id', { length: 36 }).references(() => payments.id).notNull(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  reminderDate: timestamp('reminder_date').notNull(),
  reminderType: varchar('reminder_type', { length: 20 }).notNull(), // email, sms, whatsapp
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, sent, failed
  message: text('message'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Tabla de gastos/expenses
export const expenses = pgTable('expenses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  propertyId: varchar('property_id', { length: 36 }).references(() => properties.id),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // maintenance, utilities, insurance, tax, etc.
  description: varchar('description', { length: 200 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  expenseDate: date('expense_date').notNull(),
  receiptFile: varchar('receipt_file', { length: 500 }), // URL del recibo
  vendor: varchar('vendor', { length: 100 }), // Proveedor
  isRecurring: boolean('is_recurring').default(false),
  recurringFrequency: varchar('recurring_frequency', { length: 20 }), // monthly, yearly
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de mantenimiento
export const maintenanceRequests = pgTable('maintenance_requests', {
  id: varchar('id', { length: 36 }).primaryKey(),
  propertyId: varchar('property_id', { length: 36 }).references(() => properties.id).notNull(),
  renterId: varchar('renter_id', { length: 36 }).references(() => renters.id),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull(), // plumbing, electrical, hvac, general, etc.
  priority: varchar('priority', { length: 20 }).notNull().default('medium'), // low, medium, high, urgent
  status: varchar('status', { length: 20 }).notNull().default('open'), // open, in_progress, completed, closed
  reportedDate: timestamp('reported_date').defaultNow().notNull(),
  scheduledDate: timestamp('scheduled_date'),
  completedDate: timestamp('completed_date'),
  assignedTo: varchar('assigned_to', { length: 100 }), // Técnico o empresa asignada
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 10, scale: 2 }),
  photos: json('photos'), // Array de URLs de fotos
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de disponibilidad/calendario
export const availability = pgTable('availability', {
  id: varchar('id', { length: 36 }).primaryKey(),
  propertyId: varchar('property_id', { length: 36 }).references(() => properties.id).notNull(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // available, occupied, maintenance, blocked
  reason: varchar('reason', { length: 200 }), // Razón del bloqueo o estado
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de documentos
export const documents = pgTable('documents', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  propertyId: varchar('property_id', { length: 36 }).references(() => properties.id),
  renterId: varchar('renter_id', { length: 36 }).references(() => renters.id),
  leaseId: varchar('lease_id', { length: 36 }).references(() => leases.id),
  name: varchar('name', { length: 200 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // contract, receipt, invoice, certificate, etc.
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileSize: integer('file_size'), // en bytes
  mimeType: varchar('mime_type', { length: 100 }),
  expirationDate: date('expiration_date'), // Para documentos que vencen
  isImportant: boolean('is_important').default(false),
  tags: json('tags'), // Array de tags para categorización
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de comunicaciones (emails, mensajes)
export const communications = pgTable('communications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  renterId: varchar('renter_id', { length: 36 }).references(() => renters.id),
  propertyId: varchar('property_id', { length: 36 }).references(() => properties.id),
  type: varchar('type', { length: 20 }).notNull(), // email, sms, call, note
  direction: varchar('direction', { length: 10 }).notNull(), // inbound, outbound
  subject: varchar('subject', { length: 200 }),
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).default('sent'), // sent, delivered, failed, read
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Tabla de plantillas de comunicación
export const communicationTemplates = pgTable('communication_templates', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // email, sms
  category: varchar('category', { length: 50 }).notNull(), // payment_reminder, welcome, maintenance, etc.
  subject: varchar('subject', { length: 200 }),
  content: text('content').notNull(),
  variables: json('variables'), // Variables que se pueden usar en la plantilla
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// RELACIONES
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  renters: many(renters),
  leases: many(leases),
  payments: many(payments),
  expenses: many(expenses),
  documents: many(documents)
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  user: one(users, { fields: [properties.userId], references: [users.id] }),
  leases: many(leases),
  expenses: many(expenses),
  maintenanceRequests: many(maintenanceRequests),
  availability: many(availability),
  documents: many(documents)
}));

export const rentersRelations = relations(renters, ({ one, many }) => ({
  user: one(users, { fields: [renters.userId], references: [users.id] }),
  leases: many(leases),
  maintenanceRequests: many(maintenanceRequests),
  communications: many(communications)
}));

export const leasesRelations = relations(leases, ({ one, many }) => ({
  property: one(properties, { fields: [leases.propertyId], references: [properties.id] }),
  renter: one(renters, { fields: [leases.renterId], references: [renters.id] }),
  user: one(users, { fields: [leases.userId], references: [users.id] }),
  payments: many(payments),
  documents: many(documents)
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  lease: one(leases, { fields: [payments.leaseId], references: [leases.id] }),
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  reminders: many(paymentReminders)
}));

export const paymentRemindersRelations = relations(paymentReminders, ({ one }) => ({
  payment: one(payments, { fields: [paymentReminders.paymentId], references: [payments.id] }),
  user: one(users, { fields: [paymentReminders.userId], references: [users.id] })
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  property: one(properties, { fields: [expenses.propertyId], references: [properties.id] }),
  user: one(users, { fields: [expenses.userId], references: [users.id] })
}));

export const maintenanceRequestsRelations = relations(maintenanceRequests, ({ one }) => ({
  property: one(properties, { fields: [maintenanceRequests.propertyId], references: [properties.id] }),
  renter: one(renters, { fields: [maintenanceRequests.renterId], references: [renters.id] }),
  user: one(users, { fields: [maintenanceRequests.userId], references: [users.id] })
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  property: one(properties, { fields: [availability.propertyId], references: [properties.id] }),
  user: one(users, { fields: [availability.userId], references: [users.id] })
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, { fields: [documents.userId], references: [users.id] }),
  property: one(properties, { fields: [documents.propertyId], references: [properties.id] }),
  renter: one(renters, { fields: [documents.renterId], references: [renters.id] }),
  lease: one(leases, { fields: [documents.leaseId], references: [leases.id] })
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  user: one(users, { fields: [communications.userId], references: [users.id] }),
  renter: one(renters, { fields: [communications.renterId], references: [renters.id] }),
  property: one(properties, { fields: [communications.propertyId], references: [properties.id] })
}));

export const communicationTemplatesRelations = relations(communicationTemplates, ({ one }) => ({
  user: one(users, { fields: [communicationTemplates.userId], references: [users.id] })
}));

export const selectPropertiesSchema =  createSelectSchema(properties);
export const insertPropertiesSchema = createInsertSchema(properties);

export const selectRentersSchema =  createSelectSchema(renters);
export const insertRentersSchema = createInsertSchema(renters);

export const selectLeasesSchema =  createSelectSchema(leases);
export const insertLeasesSchema = createInsertSchema(leases);

export type Property = typeof properties.$inferSelect;
export type Renter = typeof renters.$inferSelect;
export type Lease = typeof leases.$inferSelect;

