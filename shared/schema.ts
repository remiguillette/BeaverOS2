import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  incidentNumber: text("incident_number").notNull().unique(),
  type: text("type").notNull(), // fire, accident, assault, medical, etc.
  priority: text("priority").notNull(), // high, medium, low
  status: text("status").notNull().default("new"), // new, dispatched, active, resolved
  address: text("address").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  complainant: text("complainant"),
  description: text("description").notNull(),
  peopleInvolved: integer("people_involved").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  unitNumber: text("unit_number").notNull().unique(),
  type: text("type").notNull(), // police, fire, ambulance
  status: text("status").notNull().default("available"), // available, dispatched, responding, enroute, busy, off_duty
  currentLocation: text("current_location"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  assignedIncidentId: integer("assigned_incident_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const incidentUnits = pgTable("incident_units", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id").notNull(),
  unitId: integer("unit_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  status: text("status").notNull().default("assigned"), // assigned, enroute, arrived, completed
});

export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  name: text("name"),
  species: text("species").notNull(), // dog, cat, other
  breed: text("breed"),
  color: text("color"),
  age: text("age"), // approximate age like "2 years", "6 months", "unknown"
  gender: text("gender"), // male, female, unknown
  size: text("size"), // small, medium, large
  healthStatus: text("health_status").notNull(), // healthy, injured, sick, deceased
  healthNotes: text("health_notes"), // detailed health information
  foundLocation: text("found_location"), // where the animal was found
  foundDate: timestamp("found_date"),
  surrenderLocation: text("surrender_location"), // spa, kennel, veterinary hospital, etc.
  surrenderDate: timestamp("surrender_date"),
  surrenderReason: text("surrender_reason"),
  isWild: boolean("is_wild").default(false),
  isStray: boolean("is_stray").default(false),
  hasOwner: boolean("has_owner").default(false),
  ownerName: text("owner_name"),
  ownerPhone: text("owner_phone"),
  ownerAddress: text("owner_address"),
  ownerEmail: text("owner_email"),
  microchipNumber: text("microchip_number"),
  registrationNumber: text("registration_number").unique(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const enforcementReports = pgTable("enforcement_reports", {
  id: serial("id").primaryKey(),
  reportNumber: text("report_number").notNull().unique(),
  type: text("type").notNull(), // municipal_report, ticket, warning
  violationType: text("violation_type").notNull(), // unleashed_dog, noise_complaint, etc.
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  officerName: text("officer_name").notNull(),
  violatorName: text("violator_name"),
  violatorAddress: text("violator_address"),
  violatorPhone: text("violator_phone"),
  animalId: integer("animal_id"), // reference to animals table if applicable
  description: text("description").notNull(),
  fineAmount: real("fine_amount"),
  status: text("status").notNull().default("active"), // active, paid, contested, dismissed
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id").notNull().unique(),
  // Identity
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  phoneticName: text("phonetic_name"), // phonetic spelling for pronunciation
  nickname: text("nickname"),
  dateOfBirth: timestamp("date_of_birth"),
  // Contact Information
  homePhone: text("home_phone"),
  workPhone: text("work_phone"),
  workExtension: text("work_extension"),
  email: text("email"),
  // Address
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  // Professional Information
  group: text("group"), // customer group/category
  professionalInfo: text("professional_info"),
  professionalLicenseNumber: text("professional_license_number"),
  // Identification
  driverLicenseNumber: text("driver_license_number"),
  // Notes and Other
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  uid: text("uid").notNull().unique(),
  token: text("token").notNull(),
  hash: text("hash").notNull(),
  status: text("status").notNull().default("Processed"), // Processed, Signed, Draft
  author: text("author").notNull(),
  originalFileName: text("original_file_name").notNull(),
  originalPdfData: text("original_pdf_data"), // base64 encoded PDF data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id"), // reference to customers table
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerAddress: text("customer_address"),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue, cancelled
  dueDate: timestamp("due_date"),
  description: text("description"),
  items: text("items"), // JSON string of invoice items
  taxAmount: real("tax_amount").default(0),
  discountAmount: real("discount_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  paymentMethod: text("payment_method"), // paypal, googlepay, cash, check
  paypalOrderId: text("paypal_order_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentId: text("payment_id").notNull().unique(),
  invoiceId: integer("invoice_id"), // reference to invoices table
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  paymentMethod: text("payment_method").notNull(), // paypal, googlepay, cash, check
  paymentStatus: text("payment_status").notNull(), // pending, completed, failed, refunded
  transactionId: text("transaction_id"), // external transaction ID from payment provider
  paypalOrderId: text("paypal_order_id"),
  googlePayToken: text("google_pay_token"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  description: text("description"),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posTransactions = pgTable("pos_transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  type: text("type").notNull(), // sale, refund, void
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  paymentMethod: text("payment_method").notNull(), // paypal, googlepay, cash, card
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  items: text("items"), // JSON string of POS items
  taxAmount: real("tax_amount").default(0),
  discountAmount: real("discount_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed, refunded
  transactionReference: text("transaction_reference"), // external reference
  receiptNumber: text("receipt_number"),
  employeeId: text("employee_id"), // which employee processed the transaction
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  updatedAt: true,
});

export const insertIncidentUnitSchema = createInsertSchema(incidentUnits).omit({
  id: true,
  assignedAt: true,
});

export const insertAnimalSchema = createInsertSchema(animals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnforcementReportSchema = createInsertSchema(enforcementReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  fineAmount: z.union([z.number(), z.string().transform((str) => str === "" ? undefined : Number(str))]).optional(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  customerId: z.string().optional(),
  dateOfBirth: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dueDate: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
  amount: z.union([z.number(), z.string().transform((str) => Number(str))]),
  taxAmount: z.union([z.number(), z.string().transform((str) => str === "" ? 0 : Number(str))]).optional(),
  discountAmount: z.union([z.number(), z.string().transform((str) => str === "" ? 0 : Number(str))]).optional(),
  totalAmount: z.union([z.number(), z.string().transform((str) => Number(str))]),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.union([z.number(), z.string().transform((str) => Number(str))]),
});

export const insertPosTransactionSchema = createInsertSchema(posTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.union([z.number(), z.string().transform((str) => Number(str))]),
  taxAmount: z.union([z.number(), z.string().transform((str) => str === "" ? 0 : Number(str))]).optional(),
  discountAmount: z.union([z.number(), z.string().transform((str) => str === "" ? 0 : Number(str))]).optional(),
  totalAmount: z.union([z.number(), z.string().transform((str) => Number(str))]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type IncidentUnit = typeof incidentUnits.$inferSelect;
export type InsertIncidentUnit = z.infer<typeof insertIncidentUnitSchema>;
export type Animal = typeof animals.$inferSelect;
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type EnforcementReport = typeof enforcementReports.$inferSelect;
export type InsertEnforcementReport = z.infer<typeof insertEnforcementReportSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type PosTransaction = typeof posTransactions.$inferSelect;
export type InsertPosTransaction = z.infer<typeof insertPosTransactionSchema>;
