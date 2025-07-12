import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  department: text("department"),
  position: text("position"),
  phone: text("phone"),
  avatar: text("avatar"), // URL to profile picture
  accessLevel: text("access_level").notNull().default("User"), // SuperAdmin, Admin, IT Web Support, 911 Supervisor, 911 Dispatcher, User
  employeePin: text("employee_pin"), // 4-digit PIN for 911 Dispatcher authentication
  chipCardId: text("chip_card_id"), // Chip card ID for scanner authentication
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 911 Call Entry Tracking
export const callEntryLogs = pgTable("call_entry_logs", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id").references(() => incidents.id),
  callTakerId: integer("call_taker_id").references(() => users.id),
  callTakerName: text("call_taker_name").notNull(),
  authMethod: text("auth_method").notNull(), // "pin" or "chip_card"
  entryTime: timestamp("entry_time").defaultNow(),
  sessionId: text("session_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
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
  
  // 911 Call Information
  callBackPhone: text("call_back_phone"),
  landlineDetection: boolean("landline_detection").default(false),
  locationPhone: text("location_phone"),
  callerName: text("caller_name"),
  calledFrom: text("called_from"),
  natureOfProblem: text("nature_of_problem"),
  problemCode: text("problem_code"), // red, yellow, blue
  mapPage: text("map_page"),
  city: text("city"),
  crossStreet: text("cross_street"),
  comments: text("comments"),
  
  // Patient Triage (Medical Emergencies)
  withPatientNow: boolean("with_patient_now"),
  numberHurtSick: integer("number_hurt_sick"),
  patientAge: text("patient_age"),
  patientGender: text("patient_gender"),
  breathingStatus: text("breathing_status"), // yes, no, unknown, uncertain, ineffective_agonal
  chiefComplaintCode: text("chief_complaint_code"),
  
  // Pregnancy-specific (if applicable)
  pregnancyComplications: text("pregnancy_complications"), // no, miscarriage, threatened_miscarriage, stillbirth
  pregnancyWeeks: text("pregnancy_weeks"), // trimester or specific weeks
  babyVisible: text("baby_visible"), // no, completely_out, head_visible, etc.
  
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  password: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCallEntryLogSchema = createInsertSchema(callEntryLogs).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type CallEntryLog = typeof callEntryLogs.$inferSelect;
export type InsertCallEntryLog = z.infer<typeof insertCallEntryLogSchema>;

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

// BeaverRisk tables
export const riskLocations = pgTable("risk_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // hospital, school, power_plant, industrial, flood_zone, etc.
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  description: text("description"),
  capacity: integer("capacity"), // for hospitals, schools, etc.
  contactInfo: text("contact_info"),
  operatingHours: text("operating_hours"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  riskType: text("risk_type").notNull(), // fire, flood, landslide, hazmat, pandemic, power_outage, etc.
  locationId: integer("location_id"), // optional reference to risk_locations
  severityScore: integer("severity_score").notNull().default(1), // 1-5 scale
  probabilityScore: integer("probability_score").notNull().default(1), // 1-5 scale
  humanImpact: integer("human_impact").notNull().default(1), // 1-5 scale
  economicImpact: integer("economic_impact").notNull().default(1), // 1-5 scale
  environmentalImpact: integer("environmental_impact").notNull().default(1), // 1-5 scale
  riskLevel: text("risk_level").notNull().default("low"), // low, medium, high, critical
  description: text("description").notNull(),
  affectedPopulation: integer("affected_population").default(0),
  estimatedDamages: real("estimated_damages").default(0),
  lastReviewDate: timestamp("last_review_date"),
  nextReviewDate: timestamp("next_review_date"),
  status: text("status").notNull().default("active"), // active, mitigated, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mitigationPlans = pgTable("mitigation_plans", {
  id: serial("id").primaryKey(),
  riskAssessmentId: integer("risk_assessment_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  responsibleDepartment: text("responsible_department"),
  estimatedCost: real("estimated_cost").default(0),
  timeline: text("timeline"), // immediate, short_term, long_term
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("planned"), // planned, in_progress, completed, cancelled
  startDate: timestamp("start_date"),
  targetCompletionDate: timestamp("target_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  resources: text("resources"), // personnel, equipment, budget details
  successMetrics: text("success_metrics"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const riskEvents = pgTable("risk_events", {
  id: serial("id").primaryKey(),
  riskAssessmentId: integer("risk_assessment_id").notNull(),
  eventDate: timestamp("event_date").notNull(),
  eventType: text("event_type").notNull(), // incident, drill, exercise, review
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().default("low"), // low, medium, high, critical
  actualImpact: text("actual_impact"),
  responseTime: integer("response_time_minutes"),
  resourcesUsed: text("resources_used"),
  lessonsLearned: text("lessons_learned"),
  followUpActions: text("follow_up_actions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BeaverAudit tables
export const auditSchedules = pgTable("audit_schedules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  auditType: text("audit_type").notNull(), // recurring, one_time
  facilityType: text("facility_type").notNull(), // command_post, community_center, pound, vehicle, equipment
  missionType: text("mission_type").notNull(), // animal_intervention, fire_safety, first_aid, health_safety
  standardsFramework: text("standards_framework").notNull(), // OHS, PSC, PAWS, municipal_laws, CSA
  inspectorId: text("inspector_id").notNull(),
  inspectorName: text("inspector_name").notNull(),
  location: text("location").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  frequency: text("frequency"), // daily, weekly, monthly, quarterly, annually
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditTemplates = pgTable("audit_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  facilityType: text("facility_type").notNull(),
  missionType: text("mission_type").notNull(),
  standardsFramework: text("standards_framework").notNull(),
  questions: text("questions"), // JSON string of audit questions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditReports = pgTable("audit_reports", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull(),
  reportNumber: text("report_number").notNull().unique(),
  auditDate: timestamp("audit_date").notNull(),
  inspectorId: text("inspector_id").notNull(),
  inspectorName: text("inspector_name").notNull(),
  location: text("location").notNull(),
  facilityType: text("facility_type").notNull(),
  missionType: text("mission_type").notNull(),
  standardsFramework: text("standards_framework").notNull(),
  overallScore: real("overall_score").default(0), // compliance percentage
  totalItems: integer("total_items").default(0),
  compliantItems: integer("compliant_items").default(0),
  nonCompliantItems: integer("non_compliant_items").default(0),
  criticalIssues: integer("critical_issues").default(0),
  responses: text("responses"), // JSON string of audit responses
  digitalSignature: text("digital_signature"),
  signedAt: timestamp("signed_at"),
  status: text("status").notNull().default("draft"), // draft, completed, reviewed, approved
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditNonCompliances = pgTable("audit_non_compliances", {
  id: serial("id").primaryKey(),
  auditReportId: integer("audit_report_id").notNull(),
  itemNumber: text("item_number").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // critical, minor, urgent
  category: text("category"), // safety, documentation, equipment, training
  standardReference: text("standard_reference"),
  correctiveAction: text("corrective_action"),
  assignedTo: text("assigned_to"),
  assignedToName: text("assigned_to_name"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  evidence: text("evidence"), // JSON string of evidence files/photos
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditEvidence = pgTable("audit_evidence", {
  id: serial("id").primaryKey(),
  auditReportId: integer("audit_report_id").notNull(),
  nonComplianceId: integer("non_compliance_id"), // optional reference
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // photo, video, pdf, document
  fileSize: integer("file_size"),
  fileData: text("file_data"), // base64 encoded file data
  gpsLatitude: real("gps_latitude"),
  gpsLongitude: real("gps_longitude"),
  timestamp: timestamp("timestamp").defaultNow(),
  description: text("description"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// BeaverRisk insert schemas
export const insertRiskLocationSchema = createInsertSchema(riskLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  lastReviewDate: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
  nextReviewDate: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
  estimatedDamages: z.union([z.number(), z.string().transform((str) => str === "" ? 0 : Number(str))]).optional(),
});

export const insertMitigationPlanSchema = createInsertSchema(mitigationPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  estimatedCost: z.union([z.number(), z.string().transform((str) => str === "" ? 0 : Number(str))]).optional(),
  startDate: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
  targetCompletionDate: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
  actualCompletionDate: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
});

export const insertRiskEventSchema = createInsertSchema(riskEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  eventDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
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

// BeaverRisk types
export type RiskLocation = typeof riskLocations.$inferSelect;
export type InsertRiskLocation = z.infer<typeof insertRiskLocationSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type MitigationPlan = typeof mitigationPlans.$inferSelect;
export type InsertMitigationPlan = z.infer<typeof insertMitigationPlanSchema>;
export type RiskEvent = typeof riskEvents.$inferSelect;
export type InsertRiskEvent = z.infer<typeof insertRiskEventSchema>;

// BeaverAudit insert schemas
export const insertAuditScheduleSchema = createInsertSchema(auditSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

export const insertAuditTemplateSchema = createInsertSchema(auditTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditReportSchema = createInsertSchema(auditReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  auditDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  signedAt: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
  overallScore: z.union([z.number(), z.string().transform((str) => str === "" ? 0 : Number(str))]).optional(),
});

export const insertAuditNonComplianceSchema = createInsertSchema(auditNonCompliances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dueDate: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
  resolvedAt: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
});

export const insertAuditEvidenceSchema = createInsertSchema(auditEvidence).omit({
  id: true,
  createdAt: true,
}).extend({
  timestamp: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
  fileSize: z.union([z.number(), z.string().transform((str) => str === "" ? undefined : Number(str))]).optional(),
});

// BeaverDMV - License and Vehicle Registration Tables
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  syncId: text("sync_id").unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  phone: text("phone"),
  email: text("email"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  syncId: text("sync_id").unique(),
  owner: text("owner").notNull(), // character ID
  characterId: integer("character_id").references(() => characters.id),
  type: text("type").notNull().default("DRIVERS"), // DRIVERS, MOTORCYCLE, CDL, etc.
  licenseNumber: text("license_number").notNull().unique(),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, SUSPENDED, EXPIRED, REVOKED
  expiration: timestamp("expiration").notNull(),
  restrictions: text("restrictions"), // glasses required, daylight only, etc.
  endorsements: text("endorsements"), // motorcycle, hazmat, etc.
  issueDate: timestamp("issue_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicleRegistrations = pgTable("vehicle_registrations", {
  id: serial("id").primaryKey(),
  syncId: text("sync_id").unique(),
  owner: text("owner").notNull(), // character ID
  characterId: integer("character_id").references(() => characters.id),
  // Vehicle details
  vehicleType: text("vehicle_type").notNull(), // COUPE, SEDAN, SUV, TRUCK, MOTORCYCLE, etc.
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  color: text("color").notNull(),
  plate: text("plate").notNull().unique(),
  vin: text("vin").unique(),
  // Registration details
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, EXPIRED, SUSPENDED, STOLEN
  expiration: timestamp("expiration").notNull(),
  registrationNumber: text("registration_number").unique(),
  insuranceCompany: text("insurance_company"),
  insurancePolicy: text("insurance_policy"),
  insuranceExpiration: timestamp("insurance_expiration"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// BeaverDMV Insert Schemas
export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateOfBirth: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiration: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  issueDate: z.union([z.date(), z.string().transform((str) => str === "" ? new Date() : new Date(str))]).optional(),
});

export const insertVehicleRegistrationSchema = createInsertSchema(vehicleRegistrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiration: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  insuranceExpiration: z.union([z.date(), z.string().transform((str) => str === "" ? undefined : new Date(str))]).optional(),
});

// BeaverDMV types
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type VehicleRegistration = typeof vehicleRegistrations.$inferSelect;
export type InsertVehicleRegistration = z.infer<typeof insertVehicleRegistrationSchema>;

// BeaverAudit types
export type AuditSchedule = typeof auditSchedules.$inferSelect;
export type InsertAuditSchedule = z.infer<typeof insertAuditScheduleSchema>;
export type AuditTemplate = typeof auditTemplates.$inferSelect;
export type InsertAuditTemplate = z.infer<typeof insertAuditTemplateSchema>;
export type AuditReport = typeof auditReports.$inferSelect;
export type InsertAuditReport = z.infer<typeof insertAuditReportSchema>;
export type AuditNonCompliance = typeof auditNonCompliances.$inferSelect;
export type InsertAuditNonCompliance = z.infer<typeof insertAuditNonComplianceSchema>;
export type AuditEvidence = typeof auditEvidence.$inferSelect;
export type InsertAuditEvidence = z.infer<typeof insertAuditEvidenceSchema>;


