import { users, type User, type InsertUser, type UpdateUserProfile, type Incident, type InsertIncident, type Unit, type InsertUnit, type IncidentUnit, type InsertIncidentUnit, type Animal, type InsertAnimal, type EnforcementReport, type InsertEnforcementReport, type Customer, type InsertCustomer, type Document, type InsertDocument, type Invoice, type InsertInvoice, type Payment, type InsertPayment, type PosTransaction, type InsertPosTransaction, type RiskLocation, type InsertRiskLocation, type RiskAssessment, type InsertRiskAssessment, type MitigationPlan, type InsertMitigationPlan, type RiskEvent, type InsertRiskEvent, type AuditSchedule, type InsertAuditSchedule, type AuditTemplate, type InsertAuditTemplate, type AuditReport, type InsertAuditReport, type AuditNonCompliance, type InsertAuditNonCompliance, type AuditEvidence, type InsertAuditEvidence, type Character, type InsertCharacter, type License, type InsertLicense, type VehicleRegistration, type InsertVehicleRegistration, type CallEntryLog, type InsertCallEntryLog } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserProfile(id: number, profileData: UpdateUserProfile): Promise<User | undefined>;
  verifyEmployeePin(userId: number, pin: string): Promise<boolean>;
  verifyChipCard(chipCardId: string): Promise<User | undefined>;
  
  // Call entry log operations
  createCallEntryLog(log: InsertCallEntryLog): Promise<CallEntryLog>;
  getCallEntryLogs(incidentId?: number): Promise<CallEntryLog[]>;
  getCallEntryLogsByUser(userId: number): Promise<CallEntryLog[]>;
  
  // Incident operations
  createIncident(incident: InsertIncident): Promise<Incident>;
  getIncident(id: number): Promise<Incident | undefined>;
  getAllIncidents(): Promise<Incident[]>;
  updateIncident(id: number, updates: Partial<Incident>): Promise<Incident | undefined>;
  
  // Unit operations
  createUnit(unit: InsertUnit): Promise<Unit>;
  getUnit(id: number): Promise<Unit | undefined>;
  getAllUnits(): Promise<Unit[]>;
  updateUnit(id: number, updates: Partial<Unit>): Promise<Unit | undefined>;
  
  // Incident-Unit assignment operations
  assignUnitToIncident(assignment: InsertIncidentUnit): Promise<IncidentUnit>;
  getIncidentUnits(incidentId: number): Promise<IncidentUnit[]>;
  getUnitAssignments(unitId: number): Promise<IncidentUnit[]>;
  
  // Animal operations
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  getAnimal(id: number): Promise<Animal | undefined>;
  getAllAnimals(): Promise<Animal[]>;
  updateAnimal(id: number, updates: Partial<Animal>): Promise<Animal | undefined>;
  getAnimalsByOwner(ownerName: string): Promise<Animal[]>;
  
  // Enforcement report operations
  createEnforcementReport(report: InsertEnforcementReport): Promise<EnforcementReport>;
  getEnforcementReport(id: number): Promise<EnforcementReport | undefined>;
  getAllEnforcementReports(): Promise<EnforcementReport[]>;
  updateEnforcementReport(id: number, updates: Partial<EnforcementReport>): Promise<EnforcementReport | undefined>;
  
  // Customer operations
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined>;
  searchCustomers(query: string): Promise<Customer[]>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  getDocumentByUid(uid: string): Promise<Document | undefined>;
  
  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined>;
  getPaymentByPaymentId(paymentId: string): Promise<Payment | undefined>;
  getPaymentsByInvoiceId(invoiceId: number): Promise<Payment[]>;
  
  // POS Transaction operations
  createPosTransaction(transaction: InsertPosTransaction): Promise<PosTransaction>;
  getPosTransaction(id: number): Promise<PosTransaction | undefined>;
  getAllPosTransactions(): Promise<PosTransaction[]>;
  updatePosTransaction(id: number, updates: Partial<PosTransaction>): Promise<PosTransaction | undefined>;
  getPosTransactionByTransactionId(transactionId: string): Promise<PosTransaction | undefined>;
  
  // BeaverRisk operations
  // Risk Location operations
  createRiskLocation(location: InsertRiskLocation): Promise<RiskLocation>;
  getRiskLocation(id: number): Promise<RiskLocation | undefined>;
  getAllRiskLocations(): Promise<RiskLocation[]>;
  updateRiskLocation(id: number, updates: Partial<RiskLocation>): Promise<RiskLocation | undefined>;
  
  // Risk Assessment operations
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  getRiskAssessment(id: number): Promise<RiskAssessment | undefined>;
  getAllRiskAssessments(): Promise<RiskAssessment[]>;
  updateRiskAssessment(id: number, updates: Partial<RiskAssessment>): Promise<RiskAssessment | undefined>;
  
  // Mitigation Plan operations
  createMitigationPlan(plan: InsertMitigationPlan): Promise<MitigationPlan>;
  getMitigationPlan(id: number): Promise<MitigationPlan | undefined>;
  getAllMitigationPlans(): Promise<MitigationPlan[]>;
  updateMitigationPlan(id: number, updates: Partial<MitigationPlan>): Promise<MitigationPlan | undefined>;
  getMitigationPlansByRiskAssessment(riskAssessmentId: number): Promise<MitigationPlan[]>;
  
  // Risk Event operations
  createRiskEvent(event: InsertRiskEvent): Promise<RiskEvent>;
  getRiskEvent(id: number): Promise<RiskEvent | undefined>;
  getAllRiskEvents(): Promise<RiskEvent[]>;
  updateRiskEvent(id: number, updates: Partial<RiskEvent>): Promise<RiskEvent | undefined>;
  getRiskEventsByAssessment(riskAssessmentId: number): Promise<RiskEvent[]>;
  
  // BeaverAudit operations
  // Audit Schedule operations
  createAuditSchedule(schedule: InsertAuditSchedule): Promise<AuditSchedule>;
  getAuditSchedule(id: number): Promise<AuditSchedule | undefined>;
  getAllAuditSchedules(): Promise<AuditSchedule[]>;
  updateAuditSchedule(id: number, updates: Partial<AuditSchedule>): Promise<AuditSchedule | undefined>;
  getAuditSchedulesByInspector(inspectorId: string): Promise<AuditSchedule[]>;
  
  // Audit Template operations
  createAuditTemplate(template: InsertAuditTemplate): Promise<AuditTemplate>;
  getAuditTemplate(id: number): Promise<AuditTemplate | undefined>;
  getAllAuditTemplates(): Promise<AuditTemplate[]>;
  updateAuditTemplate(id: number, updates: Partial<AuditTemplate>): Promise<AuditTemplate | undefined>;
  getAuditTemplatesByType(facilityType: string, missionType: string): Promise<AuditTemplate[]>;
  
  // Audit Report operations
  createAuditReport(report: InsertAuditReport): Promise<AuditReport>;
  getAuditReport(id: number): Promise<AuditReport | undefined>;
  getAllAuditReports(): Promise<AuditReport[]>;
  updateAuditReport(id: number, updates: Partial<AuditReport>): Promise<AuditReport | undefined>;
  getAuditReportsBySchedule(scheduleId: number): Promise<AuditReport[]>;
  getAuditReportsByInspector(inspectorId: string): Promise<AuditReport[]>;
  
  // Audit Non-Compliance operations
  createAuditNonCompliance(nonCompliance: InsertAuditNonCompliance): Promise<AuditNonCompliance>;
  getAuditNonCompliance(id: number): Promise<AuditNonCompliance | undefined>;
  getAllAuditNonCompliances(): Promise<AuditNonCompliance[]>;
  updateAuditNonCompliance(id: number, updates: Partial<AuditNonCompliance>): Promise<AuditNonCompliance | undefined>;
  getAuditNonCompliancesByReport(auditReportId: number): Promise<AuditNonCompliance[]>;
  getAuditNonCompliancesByStatus(status: string): Promise<AuditNonCompliance[]>;
  
  // Audit Evidence operations
  createAuditEvidence(evidence: InsertAuditEvidence): Promise<AuditEvidence>;
  getAuditEvidence(id: number): Promise<AuditEvidence | undefined>;
  getAllAuditEvidence(): Promise<AuditEvidence[]>;
  updateAuditEvidence(id: number, updates: Partial<AuditEvidence>): Promise<AuditEvidence | undefined>;
  getAuditEvidenceByReport(auditReportId: number): Promise<AuditEvidence[]>;
  getAuditEvidenceByNonCompliance(nonComplianceId: number): Promise<AuditEvidence[]>;

  // BeaverDMV operations
  // Character operations
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(id: number): Promise<Character | undefined>;
  getAllCharacters(): Promise<Character[]>;
  updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined>;
  searchCharacters(query: string): Promise<Character[]>;
  getCharacterBySyncId(syncId: string): Promise<Character | undefined>;

  // License operations
  createLicense(license: InsertLicense): Promise<License>;
  getLicense(id: number): Promise<License | undefined>;
  getAllLicenses(): Promise<License[]>;
  updateLicense(id: number, updates: Partial<License>): Promise<License | undefined>;
  getLicenseByNumber(licenseNumber: string): Promise<License | undefined>;
  getLicensesByCharacterId(characterId: number): Promise<License[]>;
  getLicensesByOwner(owner: string): Promise<License[]>;

  // Vehicle Registration operations  
  createVehicleRegistration(registration: InsertVehicleRegistration): Promise<VehicleRegistration>;
  getVehicleRegistration(id: number): Promise<VehicleRegistration | undefined>;
  getAllVehicleRegistrations(): Promise<VehicleRegistration[]>;
  updateVehicleRegistration(id: number, updates: Partial<VehicleRegistration>): Promise<VehicleRegistration | undefined>;
  getVehicleRegistrationByPlate(plate: string): Promise<VehicleRegistration | undefined>;
  getVehicleRegistrationByVin(vin: string): Promise<VehicleRegistration | undefined>;
  getVehicleRegistrationsByCharacterId(characterId: number): Promise<VehicleRegistration[]>;
  getVehicleRegistrationsByOwner(owner: string): Promise<VehicleRegistration[]>;


}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private incidents: Map<number, Incident>;
  private units: Map<number, Unit>;
  private incidentUnits: Map<number, IncidentUnit>;
  private animals: Map<number, Animal>;
  private enforcementReports: Map<number, EnforcementReport>;
  private customers: Map<number, Customer>;
  private documents: Map<number, Document>;
  private invoices: Map<number, Invoice>;
  private payments: Map<number, Payment>;
  private posTransactions: Map<number, PosTransaction>;
  private riskLocations: Map<number, RiskLocation>;
  private riskAssessments: Map<number, RiskAssessment>;
  private mitigationPlans: Map<number, MitigationPlan>;
  private riskEvents: Map<number, RiskEvent>;
  private auditSchedules: Map<number, AuditSchedule>;
  private auditTemplates: Map<number, AuditTemplate>;
  private auditReports: Map<number, AuditReport>;
  private auditNonCompliances: Map<number, AuditNonCompliance>;
  private auditEvidence: Map<number, AuditEvidence>;
  private characters: Map<number, Character>;
  private licenses: Map<number, License>;
  private vehicleRegistrations: Map<number, VehicleRegistration>;
  private callEntryLogs: Map<number, CallEntryLog>;
  private currentUserId: number;
  private currentIncidentId: number;
  private currentUnitId: number;
  private currentIncidentUnitId: number;
  private currentAnimalId: number;
  private currentEnforcementReportId: number;
  private currentCustomerId: number;
  private currentDocumentId: number;
  private currentInvoiceId: number;
  private currentPaymentId: number;
  private currentPosTransactionId: number;
  private currentRiskLocationId: number;
  private currentRiskAssessmentId: number;
  private currentMitigationPlanId: number;
  private currentRiskEventId: number;
  private currentAuditScheduleId: number;
  private currentAuditTemplateId: number;
  private currentAuditReportId: number;
  private currentAuditNonComplianceId: number;
  private currentAuditEvidenceId: number;
  private currentCharacterId: number;
  private currentLicenseId: number;
  private currentVehicleRegistrationId: number;
  private currentCallEntryLogId: number;

  constructor() {
    this.users = new Map();
    this.incidents = new Map();
    this.units = new Map();
    this.incidentUnits = new Map();
    this.animals = new Map();
    this.enforcementReports = new Map();
    this.customers = new Map();
    this.documents = new Map();
    this.invoices = new Map();
    this.payments = new Map();
    this.posTransactions = new Map();
    this.riskLocations = new Map();
    this.riskAssessments = new Map();
    this.mitigationPlans = new Map();
    this.riskEvents = new Map();
    this.auditSchedules = new Map();
    this.auditTemplates = new Map();
    this.auditReports = new Map();
    this.auditNonCompliances = new Map();
    this.auditEvidence = new Map();
    this.characters = new Map();
    this.licenses = new Map();
    this.vehicleRegistrations = new Map();
    this.callEntryLogs = new Map();
    this.currentUserId = 1;
    this.currentIncidentId = 1;
    this.currentUnitId = 1;
    this.currentIncidentUnitId = 1;
    this.currentAnimalId = 1;
    this.currentEnforcementReportId = 1;
    this.currentCustomerId = 1;
    this.currentDocumentId = 1;
    this.currentInvoiceId = 1;
    this.currentPaymentId = 1;
    this.currentPosTransactionId = 1;
    this.currentRiskLocationId = 1;
    this.currentRiskAssessmentId = 1;
    this.currentMitigationPlanId = 1;
    this.currentRiskEventId = 1;
    this.currentAuditScheduleId = 1;
    this.currentAuditTemplateId = 1;
    this.currentAuditReportId = 1;
    this.currentAuditNonComplianceId = 1;
    this.currentAuditEvidenceId = 1;
    this.currentCharacterId = 1;
    this.currentLicenseId = 1;
    this.currentVehicleRegistrationId = 1;
    this.currentCallEntryLogId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample user
    const sampleUser: User = {
      id: 1,
      username: "remiguillette",
      password: "MC44rg99qc@",
      firstName: "Rémi",
      lastName: "Guillette",
      email: "r.guillette@beavernet.system",
      department: "Administration",
      position: "System Administrator",
      phone: "+1-555-0123",
      avatar: null,
      accessLevel: "SuperAdmin",
      employeePin: "1234",
      chipCardId: "CARD-001-RG",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Sample 911 Dispatcher user
    const dispatcherUser: User = {
      id: 2,
      username: "dispatcher1",
      password: "911dispatch",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "s.johnson@beavernet.system",
      department: "Emergency Services",
      position: "911 Dispatcher",
      phone: "+1-555-0124",
      avatar: null,
      accessLevel: "911 Dispatcher",
      employeePin: "5678",
      chipCardId: "CARD-002-SJ",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(1, sampleUser);
    this.users.set(2, dispatcherUser);
    this.currentUserId = 3;

    // Sample units positioned in Niagara Falls, Ontario
    const sampleUnits = [
      { unitNumber: "P-101", type: "police", status: "available", currentLocation: "Downtown Station", latitude: 43.089, longitude: -79.084 },
      { unitNumber: "P-102", type: "police", status: "responding", currentLocation: "Rainbow Bridge", latitude: 43.088, longitude: -79.075 },
      { unitNumber: "P-103", type: "police", status: "busy", currentLocation: "Traffic Stop - Lundy's Lane", latitude: 43.095, longitude: -79.090 },
      { unitNumber: "F-201", type: "fire", status: "available", currentLocation: "Fire Station 1", latitude: 43.085, longitude: -79.080 },
      { unitNumber: "F-202", type: "fire", status: "available", currentLocation: "Fire Station 2", latitude: 43.100, longitude: -79.095 },
      { unitNumber: "A-301", type: "ambulance", status: "enroute", currentLocation: "Niagara Hospital", latitude: 43.092, longitude: -79.078 },
      { unitNumber: "A-302", type: "ambulance", status: "available", currentLocation: "Medical Center", latitude: 43.087, longitude: -79.088 },
      { unitNumber: "P-104", type: "police", status: "off_duty", currentLocation: "Police Station", latitude: 43.089, longitude: -79.084 },
    ];

    sampleUnits.forEach(unit => {
      const id = this.currentUnitId++;
      const fullUnit: Unit = {
        ...unit,
        id,
        assignedIncidentId: null,
        updatedAt: new Date(),
      };
      this.units.set(id, fullUnit);
    });

    // Sample incidents positioned in Niagara Falls, Ontario
    const sampleIncidents = [
      {
        incidentNumber: "2025-001",
        type: "medical",
        priority: "high",
        status: "active",
        address: "5685 Falls Avenue",
        latitude: 43.090,
        longitude: -79.080,
        complainant: "John Doe",
        description: "Cardiac arrest, CPR in progress",
        peopleInvolved: 1,
      },
      {
        incidentNumber: "2025-002", 
        type: "fire",
        priority: "high",
        status: "dispatched",
        address: "6420 Stanley Avenue",
        latitude: 43.098,
        longitude: -79.085,
        complainant: "Jane Smith",
        description: "Structure fire, smoke visible",
        peopleInvolved: 3,
      },
      {
        incidentNumber: "2025-003",
        type: "accident",
        priority: "medium",
        status: "new",
        address: "7373 Lundy's Lane",
        latitude: 43.093,
        longitude: -79.095,
        complainant: "Anonymous",
        description: "Two vehicle collision, minor injuries",
        peopleInvolved: 4,
      },
    ];

    sampleIncidents.forEach(incident => {
      const id = this.currentIncidentId++;
      const fullIncident: Incident = {
        ...incident,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.incidents.set(id, fullIncident);
    });

    // Sample customers
    const sampleCustomers = [
      {
        customerId: "CUS-2025-000001",
        firstName: "John",
        lastName: "Smith",
        phoneticName: "Jon Smith",
        nickname: "Johnny",
        dateOfBirth: new Date("1985-03-15"),
        homePhone: "5551234567",
        workPhone: "5559876543",
        workExtension: "101",
        email: "john.smith@email.com",
        address: "123 Oak Street",
        city: "Portland",
        state: "OR",
        zipCode: "97205",
        group: "Residential",
        professionalInfo: "Software Engineer at Tech Corp",
        professionalLicenseNumber: "ENG-12345",
        driverLicenseNumber: "OR123456789",
        notes: "Long-time customer, prefers email contact",
        status: "active",
      },
      {
        customerId: "CUS-2025-000002",
        firstName: "Sarah",
        lastName: "Johnson",
        phoneticName: "Sarah Johnson",
        nickname: "",
        dateOfBirth: new Date("1990-07-22"),
        homePhone: "5552345678",
        workPhone: "5558765432",
        workExtension: "",
        email: "sarah.johnson@business.com",
        address: "456 Pine Avenue",
        city: "Portland",
        state: "OR",
        zipCode: "97210",
        group: "Business",
        professionalInfo: "Marketing Director at Johnson & Associates",
        professionalLicenseNumber: "MKT-67890",
        driverLicenseNumber: "OR987654321",
        notes: "Business account holder, handles multiple properties",
        status: "active",
      },
      {
        customerId: "CUS-2025-000003",
        firstName: "Michael",
        lastName: "Brown",
        phoneticName: "My-kel Brown",
        nickname: "Mike",
        dateOfBirth: new Date("1978-12-03"),
        homePhone: "5553456789",
        workPhone: "",
        workExtension: "",
        email: "m.brown@contractor.net",
        address: "789 Cedar Drive",
        city: "Beaverton",
        state: "OR",
        zipCode: "97008",
        group: "Contractor",
        professionalInfo: "Licensed General Contractor",
        professionalLicenseNumber: "CCB-54321",
        driverLicenseNumber: "OR456789123",
        notes: "Reliable contractor, specializes in residential work",
        status: "active",
      },
      {
        customerId: "CUS-2025-000004",
        firstName: "Emily",
        lastName: "Davis",
        phoneticName: "Em-ih-lee Davis",
        nickname: "Em",
        dateOfBirth: new Date("1992-05-18"),
        homePhone: "5554567890",
        workPhone: "5557654321",
        workExtension: "205",
        email: "emily.davis@lawfirm.com",
        address: "321 Maple Court",
        city: "Lake Oswego",
        state: "OR",
        zipCode: "97034",
        group: "Professional",
        professionalInfo: "Attorney at Davis & Partners Law Firm",
        professionalLicenseNumber: "BAR-11223",
        driverLicenseNumber: "OR789123456",
        notes: "Legal professional, requires formal correspondence",
        status: "active",
      },
      {
        customerId: "CUS-2025-000005",
        firstName: "Robert",
        lastName: "Wilson",
        phoneticName: "Rob-ert Wilson",
        nickname: "Bob",
        dateOfBirth: new Date("1965-09-30"),
        homePhone: "5555678901",
        workPhone: "",
        workExtension: "",
        email: "",
        address: "654 Birch Lane",
        city: "Tigard",
        state: "OR",
        zipCode: "97223",
        group: "Senior",
        professionalInfo: "Retired Teacher",
        professionalLicenseNumber: "",
        driverLicenseNumber: "OR321654987",
        notes: "Prefers phone contact, no email",
        status: "inactive",
      },
    ];

    sampleCustomers.forEach(customer => {
      const id = this.currentCustomerId++;
      const fullCustomer: Customer = {
        ...customer,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.customers.set(id, fullCustomer);
    });

    // Sample invoices
    const sampleInvoices = [
      {
        invoiceNumber: "INV-2025-001",
        customerId: 1,
        customerName: "John Smith",
        customerEmail: "john.smith@email.com",
        customerAddress: "123 Oak Street, Portland, OR 97205",
        amount: 1500.00,
        currency: "USD",
        status: "sent",
        dueDate: new Date("2025-02-15"),
        description: "Professional services consultation",
        items: JSON.stringify([
          { name: "Consultation", quantity: 10, price: 150.00, total: 1500.00 }
        ]),
        taxAmount: 150.00,
        discountAmount: 0,
        totalAmount: 1650.00,
        paymentMethod: null,
        paypalOrderId: null,
        paidAt: null,
      },
      {
        invoiceNumber: "INV-2025-002",
        customerId: 2,
        customerName: "Sarah Johnson",
        customerEmail: "sarah.johnson@techcorp.com",
        customerAddress: "456 Pine Avenue, Portland, OR 97201",
        amount: 2500.00,
        currency: "USD",
        status: "paid",
        dueDate: new Date("2025-01-31"),
        description: "Development services",
        items: JSON.stringify([
          { name: "Development", quantity: 25, price: 100.00, total: 2500.00 }
        ]),
        taxAmount: 250.00,
        discountAmount: 50.00,
        totalAmount: 2700.00,
        paymentMethod: "paypal",
        paypalOrderId: "PAYPAL-ORDER-001",
        paidAt: new Date("2025-01-15"),
      },
      {
        invoiceNumber: "INV-2025-003",
        customerId: 3,
        customerName: "Michael Brown",
        customerEmail: "m.brown@contractor.net",
        customerAddress: "789 Cedar Drive, Beaverton, OR 97008",
        amount: 3200.00,
        currency: "USD",
        status: "overdue",
        dueDate: new Date("2025-01-05"),
        description: "Construction materials",
        items: JSON.stringify([
          { name: "Materials", quantity: 1, price: 3200.00, total: 3200.00 }
        ]),
        taxAmount: 320.00,
        discountAmount: 0,
        totalAmount: 3520.00,
        paymentMethod: null,
        paypalOrderId: null,
        paidAt: null,
      },
    ];

    sampleInvoices.forEach(invoice => {
      const id = this.currentInvoiceId++;
      const fullInvoice: Invoice = {
        ...invoice,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.invoices.set(id, fullInvoice);
    });

    // Sample payments
    const samplePayments = [
      {
        paymentId: "PAY-2025-001",
        invoiceId: 2,
        amount: 2700.00,
        currency: "USD",
        paymentMethod: "paypal",
        paymentStatus: "completed",
        transactionId: "TXN-PAYPAL-001",
        paypalOrderId: "PAYPAL-ORDER-001",
        googlePayToken: null,
        customerName: "Sarah Johnson",
        customerEmail: "sarah.johnson@techcorp.com",
        description: "Invoice payment for development services",
        receiptUrl: null,
      },
      {
        paymentId: "PAY-2025-002",
        invoiceId: null,
        amount: 150.00,
        currency: "USD",
        paymentMethod: "googlepay",
        paymentStatus: "completed",
        transactionId: "TXN-GOOGLEPAY-001",
        paypalOrderId: null,
        googlePayToken: "GOOGLEPAY-TOKEN-001",
        customerName: "Walk-in Customer",
        customerEmail: "customer@example.com",
        description: "Direct payment for service",
        receiptUrl: null,
      },
    ];

    samplePayments.forEach(payment => {
      const id = this.currentPaymentId++;
      const fullPayment: Payment = {
        ...payment,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.payments.set(id, fullPayment);
    });

    // Sample POS transactions
    const samplePosTransactions = [
      {
        transactionId: "POS-2025-001",
        type: "sale",
        amount: 45.99,
        currency: "USD",
        paymentMethod: "paypal",
        customerName: "Jane Doe",
        customerEmail: "jane.doe@email.com",
        items: JSON.stringify([
          { name: "Coffee", quantity: 2, price: 4.50, total: 9.00 },
          { name: "Sandwich", quantity: 1, price: 12.99, total: 12.99 },
          { name: "Service Fee", quantity: 1, price: 24.00, total: 24.00 }
        ]),
        taxAmount: 4.14,
        discountAmount: 0,
        totalAmount: 45.99,
        paymentStatus: "completed",
        transactionReference: "PAYPAL-POS-001",
        receiptNumber: "R-000001",
        employeeId: "EMP-001",
      },
      {
        transactionId: "POS-2025-002",
        type: "sale",
        amount: 89.50,
        currency: "USD",
        paymentMethod: "googlepay",
        customerName: "Bob Wilson",
        customerEmail: "bob.wilson@email.com",
        items: JSON.stringify([
          { name: "Consultation", quantity: 1, price: 75.00, total: 75.00 },
          { name: "Materials", quantity: 1, price: 14.50, total: 14.50 }
        ]),
        taxAmount: 8.05,
        discountAmount: 5.00,
        totalAmount: 89.50,
        paymentStatus: "completed",
        transactionReference: "GOOGLEPAY-POS-001",
        receiptNumber: "R-000002",
        employeeId: "EMP-001",
      },
    ];

    samplePosTransactions.forEach(transaction => {
      const id = this.currentPosTransactionId++;
      const fullTransaction: PosTransaction = {
        ...transaction,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.posTransactions.set(id, fullTransaction);
    });

    // Sample BeaverRisk data
    // Sample risk locations
    const sampleRiskLocations = [
      {
        name: "Beaverton General Hospital",
        type: "hospital",
        address: "4805 SW Griffith Dr, Beaverton, OR 97005",
        latitude: 45.4812,
        longitude: -122.8039,
        description: "Major regional hospital with emergency services",
        capacity: 450,
        contactInfo: "Emergency: 911, Main: (503) 644-7000",
        operatingHours: "24/7",
      },
      {
        name: "Beaverton Elementary School",
        type: "school",
        address: "12250 SW 5th St, Beaverton, OR 97005",
        latitude: 45.4890,
        longitude: -122.8086,
        description: "K-6 elementary school with 350 students",
        capacity: 350,
        contactInfo: "Phone: (503) 356-4200",
        operatingHours: "Mon-Fri 7:30 AM - 4:00 PM",
      },
      {
        name: "Westside Power Station",
        type: "power_plant",
        address: "15600 SW Walker Rd, Beaverton, OR 97006",
        latitude: 45.4623,
        longitude: -122.8450,
        description: "Natural gas power generation facility",
        capacity: 200,
        contactInfo: "Emergency: (503) 228-7711",
        operatingHours: "24/7",
      },
      {
        name: "Fanno Creek Flood Zone",
        type: "flood_zone",
        address: "Along Fanno Creek, Beaverton, OR",
        latitude: 45.4756,
        longitude: -122.8017,
        description: "100-year flood plain along Fanno Creek",
        capacity: null,
        contactInfo: "City Emergency: (503) 526-2222",
        operatingHours: null,
      },
      {
        name: "Chemical Processing Plant",
        type: "industrial",
        address: "18000 SW Tualatin Valley Hwy, Beaverton, OR 97003",
        latitude: 45.4534,
        longitude: -122.8756,
        description: "Chemical processing facility with hazardous materials",
        capacity: 50,
        contactInfo: "Emergency: (503) 644-0500",
        operatingHours: "24/7",
      },
    ];

    sampleRiskLocations.forEach(location => {
      const id = this.currentRiskLocationId++;
      const fullLocation: RiskLocation = {
        ...location,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.riskLocations.set(id, fullLocation);
    });

    // Sample risk assessments
    const sampleRiskAssessments = [
      {
        title: "Wildfire Risk Assessment - Westside",
        riskType: "fire",
        locationId: null,
        severityScore: 4,
        probabilityScore: 3,
        humanImpact: 4,
        economicImpact: 5,
        environmentalImpact: 5,
        riskLevel: "high",
        description: "High wildfire risk during dry season due to forest interface areas",
        affectedPopulation: 25000,
        estimatedDamages: 50000000,
        lastReviewDate: new Date("2024-08-15"),
        nextReviewDate: new Date("2025-08-15"),
        status: "active",
      },
      {
        title: "Fanno Creek Flood Risk",
        riskType: "flood",
        locationId: 4,
        severityScore: 3,
        probabilityScore: 2,
        humanImpact: 3,
        economicImpact: 4,
        environmentalImpact: 3,
        riskLevel: "medium",
        description: "Periodic flooding risk along Fanno Creek during heavy rainfall",
        affectedPopulation: 1200,
        estimatedDamages: 2500000,
        lastReviewDate: new Date("2024-12-01"),
        nextReviewDate: new Date("2025-12-01"),
        status: "active",
      },
      {
        title: "Chemical Plant Hazmat Incident",
        riskType: "hazmat",
        locationId: 5,
        severityScore: 5,
        probabilityScore: 1,
        humanImpact: 5,
        economicImpact: 4,
        environmentalImpact: 5,
        riskLevel: "critical",
        description: "Potential chemical release from industrial facility",
        affectedPopulation: 5000,
        estimatedDamages: 15000000,
        lastReviewDate: new Date("2024-11-20"),
        nextReviewDate: new Date("2025-05-20"),
        status: "active",
      },
    ];

    sampleRiskAssessments.forEach(assessment => {
      const id = this.currentRiskAssessmentId++;
      const fullAssessment: RiskAssessment = {
        ...assessment,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.riskAssessments.set(id, fullAssessment);
    });

    // Sample mitigation plans
    const sampleMitigationPlans = [
      {
        riskAssessmentId: 1,
        title: "Defensible Space Creation Program",
        description: "Establish 100-foot defensible space around homes in wildfire-prone areas",
        responsibleDepartment: "Fire Prevention",
        estimatedCost: 150000,
        timeline: "long_term",
        priority: "high",
        status: "in_progress",
        startDate: new Date("2024-03-01"),
        targetCompletionDate: new Date("2025-10-31"),
        actualCompletionDate: null,
        resources: "2 Fire Prevention Officers, Community Education Materials",
        successMetrics: "75% compliance rate in high-risk areas",
        notes: "Working with homeowners associations for coordination",
      },
      {
        riskAssessmentId: 2,
        title: "Fanno Creek Flood Mitigation",
        description: "Improve drainage systems and install flood barriers",
        responsibleDepartment: "Public Works",
        estimatedCost: 500000,
        timeline: "short_term",
        priority: "medium",
        status: "planned",
        startDate: new Date("2025-04-01"),
        targetCompletionDate: new Date("2025-09-30"),
        actualCompletionDate: null,
        resources: "Engineering Team, Construction Contractors",
        successMetrics: "Reduction in flood-affected properties by 60%",
        notes: "Requires coordination with county drainage authority",
      },
      {
        riskAssessmentId: 3,
        title: "Chemical Plant Emergency Response Plan",
        description: "Develop comprehensive emergency response plan for chemical incidents",
        responsibleDepartment: "Emergency Management",
        estimatedCost: 75000,
        timeline: "immediate",
        priority: "urgent",
        status: "completed",
        startDate: new Date("2024-01-15"),
        targetCompletionDate: new Date("2024-06-30"),
        actualCompletionDate: new Date("2024-06-15"),
        resources: "Emergency Management Staff, Hazmat Team",
        successMetrics: "Response time under 15 minutes",
        notes: "Plan includes evacuation procedures and shelter-in-place protocols",
      },
    ];

    sampleMitigationPlans.forEach(plan => {
      const id = this.currentMitigationPlanId++;
      const fullPlan: MitigationPlan = {
        ...plan,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.mitigationPlans.set(id, fullPlan);
    });

    // Sample risk events
    const sampleRiskEvents = [
      {
        riskAssessmentId: 1,
        eventDate: new Date("2024-07-15"),
        eventType: "incident",
        title: "Brush Fire - Cooper Mountain",
        description: "Small brush fire contained within 2 hours",
        severity: "medium",
        actualImpact: "5 acres burned, no structures damaged",
        responseTime: 12,
        resourcesUsed: "3 fire engines, 1 water tender, 15 personnel",
        lessonsLearned: "Need better access road to mountain areas",
        followUpActions: "Improve access roads, add water source",
      },
      {
        riskAssessmentId: 2,
        eventDate: new Date("2024-11-22"),
        eventType: "incident",
        title: "Fanno Creek Flooding",
        description: "Minor flooding along Fanno Creek after heavy rains",
        severity: "low",
        actualImpact: "2 residential properties with minor water damage",
        responseTime: 45,
        resourcesUsed: "Public Works crew, 2 pumps, sandbags",
        lessonsLearned: "Early warning system effective",
        followUpActions: "Continue monitoring, improve drainage",
      },
      {
        riskAssessmentId: 3,
        eventDate: new Date("2024-09-10"),
        eventType: "drill",
        title: "Chemical Plant Emergency Drill",
        description: "Quarterly emergency response drill",
        severity: "low",
        actualImpact: "Training exercise completed successfully",
        responseTime: 8,
        resourcesUsed: "Hazmat team, Emergency Management staff",
        lessonsLearned: "Communications protocol needs refinement",
        followUpActions: "Update communication procedures",
      },
    ];

    sampleRiskEvents.forEach(event => {
      const id = this.currentRiskEventId++;
      const fullEvent: RiskEvent = {
        ...event,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.riskEvents.set(id, fullEvent);
    });

    // Sample Audit Templates
    const sampleAuditTemplates = [
      {
        name: "Fire Safety Inspection - Command Post",
        facilityType: "command_post",
        missionType: "fire_safety",
        standardsFramework: "OHS",
        questions: JSON.stringify([
          { id: 1, text: "Are all emergency exits clearly marked and unobstructed?", type: "boolean", required: true },
          { id: 2, text: "Are fire extinguishers present and properly maintained?", type: "boolean", required: true },
          { id: 3, text: "Rate the condition of fire detection systems (1-5)", type: "rating", required: true },
          { id: 4, text: "Emergency lighting system operational?", type: "boolean", required: true },
          { id: 5, text: "Additional observations", type: "text", required: false }
        ])
      },
      {
        name: "Animal Welfare Inspection - Pound",
        facilityType: "pound",
        missionType: "animal_intervention",
        standardsFramework: "PAWS",
        questions: JSON.stringify([
          { id: 1, text: "Are animal enclosures clean and properly maintained?", type: "boolean", required: true },
          { id: 2, text: "Adequate food and water supply for all animals?", type: "boolean", required: true },
          { id: 3, text: "Rate the ventilation system (1-5)", type: "rating", required: true },
          { id: 4, text: "Medical isolation areas properly equipped?", type: "boolean", required: true },
          { id: 5, text: "Staff safety equipment available and used?", type: "boolean", required: true }
        ])
      },
      {
        name: "First Aid Equipment Inspection - Vehicle",
        facilityType: "vehicle",
        missionType: "first_aid",
        standardsFramework: "PSC",
        questions: JSON.stringify([
          { id: 1, text: "First aid kit present and properly stocked?", type: "boolean", required: true },
          { id: 2, text: "AED device operational and accessible?", type: "boolean", required: true },
          { id: 3, text: "Rate the condition of medical supplies (1-5)", type: "rating", required: true },
          { id: 4, text: "Emergency communication equipment functional?", type: "boolean", required: true },
          { id: 5, text: "Vehicle safety equipment inspection complete?", type: "boolean", required: true }
        ])
      }
    ];

    sampleAuditTemplates.forEach(template => {
      const id = this.currentAuditTemplateId++;
      const fullTemplate: AuditTemplate = {
        ...template,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.auditTemplates.set(id, fullTemplate);
    });

    // Sample Audit Schedules
    const sampleAuditSchedules = [
      {
        title: "Monthly Fire Safety Inspection - Main Command Post",
        auditType: "recurring",
        facilityType: "command_post",
        missionType: "fire_safety",
        standardsFramework: "OHS",
        inspectorId: "INSP001",
        inspectorName: "Sarah Mitchell",
        location: "Main Command Post - 123 Safety Blvd",
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        frequency: "monthly",
        status: "scheduled"
      },
      {
        title: "Animal Welfare Quarterly Review - Municipal Pound",
        auditType: "recurring",
        facilityType: "pound",
        missionType: "animal_intervention",
        standardsFramework: "PAWS",
        inspectorId: "INSP002",
        inspectorName: "David Rodriguez",
        location: "Municipal Animal Pound - 456 Care Street",
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        frequency: "quarterly",
        status: "scheduled"
      },
      {
        title: "Vehicle First Aid Equipment Check - Unit P-101",
        auditType: "one_time",
        facilityType: "vehicle",
        missionType: "first_aid",
        standardsFramework: "PSC",
        inspectorId: "INSP003",
        inspectorName: "Lisa Chen",
        location: "Police Vehicle P-101",
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        frequency: null,
        status: "scheduled"
      }
    ];

    sampleAuditSchedules.forEach(schedule => {
      const id = this.currentAuditScheduleId++;
      const fullSchedule: AuditSchedule = {
        ...schedule,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.auditSchedules.set(id, fullSchedule);
    });

    // Sample Audit Reports
    const sampleAuditReports = [
      {
        scheduleId: 1,
        reportNumber: "AUD-2025-001",
        auditDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        inspectorId: "INSP001",
        inspectorName: "Sarah Mitchell",
        location: "Community Center - Downtown",
        facilityType: "community_center",
        missionType: "fire_safety",
        standardsFramework: "OHS",
        overallScore: 87.5,
        totalItems: 8,
        compliantItems: 7,
        nonCompliantItems: 1,
        criticalIssues: 0,
        responses: JSON.stringify({
          "1": true, "2": true, "3": 4, "4": true, "5": false, "6": 5, "7": true, "8": "Minor issue with exit sign visibility"
        }),
        digitalSignature: "SMitchell_2025-01-05_14:30",
        signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "completed"
      },
      {
        scheduleId: 2,
        reportNumber: "AUD-2025-002",
        auditDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        inspectorId: "INSP002",
        inspectorName: "David Rodriguez",
        location: "Municipal Animal Pound",
        facilityType: "pound",
        missionType: "animal_intervention",
        standardsFramework: "PAWS",
        overallScore: 92.0,
        totalItems: 10,
        compliantItems: 9,
        nonCompliantItems: 1,
        criticalIssues: 1,
        responses: JSON.stringify({
          "1": true, "2": true, "3": 5, "4": true, "5": true, "6": false, "7": 4, "8": true, "9": true, "10": "Critical: Heating system malfunction in kennel area"
        }),
        digitalSignature: "DRodriguez_2025-01-02_16:45",
        signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "completed"
      }
    ];

    sampleAuditReports.forEach(report => {
      const id = this.currentAuditReportId++;
      const fullReport: AuditReport = {
        ...report,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.auditReports.set(id, fullReport);
    });

    // Sample Audit Non-Compliances
    const sampleNonCompliances = [
      {
        auditReportId: 1,
        itemNumber: "5",
        description: "Emergency exit sign partially obscured by equipment",
        severity: "minor",
        category: "safety",
        standardReference: "OHS-001.5",
        correctiveAction: "Relocate equipment to ensure clear visibility of exit sign",
        assignedTo: "MAINT001",
        assignedToName: "Mike Johnson",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: "medium",
        status: "open",
        resolvedAt: null,
        resolutionNotes: null,
        evidence: JSON.stringify([])
      },
      {
        auditReportId: 2,
        itemNumber: "6",
        description: "Heating system malfunction in kennel area affecting animal comfort",
        severity: "critical",
        category: "equipment",
        standardReference: "PAWS-003.2",
        correctiveAction: "Immediate repair of heating system and temporary relocation of animals if necessary",
        assignedTo: "HVAC001",
        assignedToName: "Tony Stevens",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        priority: "urgent",
        status: "in_progress",
        resolvedAt: null,
        resolutionNotes: "HVAC contractor scheduled for emergency repair",
        evidence: JSON.stringify([])
      }
    ];

    sampleNonCompliances.forEach(nc => {
      const id = this.currentAuditNonComplianceId++;
      const fullNonCompliance: AuditNonCompliance = {
        ...nc,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.auditNonCompliances.set(id, fullNonCompliance);
    });

    // BeaverDMV Sample Data
    // Sample Characters
    const sampleCharacters = [
      {
        syncId: "CHAR001",
        firstName: "John",
        lastName: "Smith",
        dateOfBirth: new Date("1985-06-15"),
        address: "123 Main Street",
        city: "Beaverton",
        province: "Ontario",
        postalCode: "K7A 2B3",
        phone: "+1-613-555-0101",
        email: "john.smith@email.com",
        emergencyContact: "Jane Smith",
        emergencyPhone: "+1-613-555-0102"
      },
      {
        syncId: "CHAR002",
        firstName: "Sarah",
        lastName: "Johnson",
        dateOfBirth: new Date("1990-03-22"),
        address: "456 Oak Avenue",
        city: "Beaverton",
        province: "Ontario",
        postalCode: "K7A 3C4",
        phone: "+1-613-555-0201",
        email: "sarah.johnson@email.com",
        emergencyContact: "Mike Johnson",
        emergencyPhone: "+1-613-555-0202"
      },
      {
        syncId: "CHAR003",
        firstName: "Robert",
        lastName: "Davis",
        dateOfBirth: new Date("1978-11-08"),
        address: "789 Pine Road",
        city: "Beaverton",
        province: "Ontario",
        postalCode: "K7A 4D5",
        phone: "+1-613-555-0301",
        email: "robert.davis@email.com",
        emergencyContact: "Lisa Davis",
        emergencyPhone: "+1-613-555-0302"
      },
      {
        syncId: "CHAR004",
        firstName: "Emily",
        lastName: "Wilson",
        dateOfBirth: new Date("1995-08-14"),
        address: "321 Cedar Lane",
        city: "Beaverton",
        province: "Ontario",
        postalCode: "K7A 5E6",
        phone: "+1-613-555-0401",
        email: "emily.wilson@email.com",
        emergencyContact: "Thomas Wilson",
        emergencyPhone: "+1-613-555-0402"
      }
    ];

    sampleCharacters.forEach(char => {
      const id = this.currentCharacterId++;
      const fullCharacter: Character = {
        ...char,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.characters.set(id, fullCharacter);
    });

    // Sample Licenses
    const sampleLicenses = [
      {
        syncId: "LIC001",
        owner: "CHAR001",
        characterId: 1,
        type: "DRIVERS",
        licenseNumber: "D12345678",
        status: "ACTIVE",
        expiration: new Date("2027-06-15"),
        restrictions: "Must wear corrective lenses",
        endorsements: null,
        issueDate: new Date("2022-06-15")
      },
      {
        syncId: "LIC002", 
        owner: "CHAR002",
        characterId: 2,
        type: "DRIVERS",
        licenseNumber: "D23456789",
        status: "ACTIVE",
        expiration: new Date("2028-03-22"),
        restrictions: null,
        endorsements: "Motorcycle",
        issueDate: new Date("2023-03-22")
      },
      {
        syncId: "LIC003",
        owner: "CHAR003",
        characterId: 3,
        type: "CDL",
        licenseNumber: "C34567890",
        status: "ACTIVE",
        expiration: new Date("2026-11-08"),
        restrictions: "No nighttime driving",
        endorsements: "Hazmat, Passenger",
        issueDate: new Date("2021-11-08")
      },
      {
        syncId: "LIC004",
        owner: "CHAR004",
        characterId: 4,
        type: "DRIVERS",
        licenseNumber: "D45678901",
        status: "SUSPENDED",
        expiration: new Date("2029-08-14"),
        restrictions: null,
        endorsements: null,
        issueDate: new Date("2024-08-14")
      }
    ];

    sampleLicenses.forEach(license => {
      const id = this.currentLicenseId++;
      const fullLicense: License = {
        ...license,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.licenses.set(id, fullLicense);
    });

    // Sample Vehicle Registrations
    const sampleVehicleRegistrations = [
      {
        syncId: "VEH001",
        owner: "CHAR001",
        characterId: 1,
        vehicleType: "SEDAN",
        make: "TOYOTA",
        model: "CAMRY",
        year: "2020",
        color: "BLUE",
        plate: "ABC123",
        vin: "1HGCM82633A123456",
        status: "ACTIVE",
        expiration: new Date("2025-12-31"),
        registrationNumber: "REG123456",
        insuranceCompany: "Beaver Insurance Co.",
        insurancePolicy: "POL123456",
        insuranceExpiration: new Date("2025-06-15")
      },
      {
        syncId: "VEH002",
        owner: "CHAR002",
        characterId: 2,
        vehicleType: "SUV",
        make: "HONDA",
        model: "CR-V",
        year: "2022",
        color: "WHITE",
        plate: "XYZ789",
        vin: "2HGCM82633A234567",
        status: "ACTIVE",
        expiration: new Date("2025-12-31"),
        registrationNumber: "REG234567",
        insuranceCompany: "Safe Drive Insurance",
        insurancePolicy: "POL234567",
        insuranceExpiration: new Date("2025-03-22")
      },
      {
        syncId: "VEH003",
        owner: "CHAR003",
        characterId: 3,
        vehicleType: "TRUCK",
        make: "FORD",
        model: "F-150",
        year: "2019",
        color: "RED",
        plate: "TRK456",
        vin: "3HGCM82633A345678",
        status: "ACTIVE",
        expiration: new Date("2025-12-31"),
        registrationNumber: "REG345678",
        insuranceCompany: "Commercial Auto Insurance",
        insurancePolicy: "POL345678",
        insuranceExpiration: new Date("2025-11-08")
      },
      {
        syncId: "VEH004",
        owner: "CHAR004",
        characterId: 4,
        vehicleType: "COUPE",
        make: "FORD",
        model: "MUSTANG",
        year: "2021",
        color: "SILVER",
        plate: "1234ABCD",
        vin: "4HGCM82633A456789",
        status: "SUSPENDED",
        expiration: new Date("2025-12-31"),
        registrationNumber: "REG456789",
        insuranceCompany: "Young Driver Insurance",
        insurancePolicy: "POL456789",
        insuranceExpiration: new Date("2025-08-14")
      },
      {
        syncId: "VEH005",
        owner: "CHAR002",
        characterId: 2,
        vehicleType: "MOTORCYCLE",
        make: "YAMAHA",
        model: "YZF-R3",
        year: "2023",
        color: "BLACK",
        plate: "BIKE88",
        vin: "5HGCM82633A567890",
        status: "ACTIVE",
        expiration: new Date("2025-12-31"),
        registrationNumber: "REG567890",
        insuranceCompany: "Motorcycle Insurance Plus",
        insurancePolicy: "POL567890",
        insuranceExpiration: new Date("2025-03-22")
      }
    ];

    sampleVehicleRegistrations.forEach(vehicle => {
      const id = this.currentVehicleRegistrationId++;
      const fullVehicle: VehicleRegistration = {
        ...vehicle,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.vehicleRegistrations.set(id, fullVehicle);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = { ...existing, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async updateUserProfile(id: number, profileData: UpdateUserProfile): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = { ...existing, ...profileData, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async verifyEmployeePin(userId: number, pin: string): Promise<boolean> {
    const user = this.users.get(userId);
    return user ? user.employeePin === pin : false;
  }

  async verifyChipCard(chipCardId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.chipCardId === chipCardId
    );
  }

  // Call entry log operations
  async createCallEntryLog(log: InsertCallEntryLog): Promise<CallEntryLog> {
    const id = this.currentCallEntryLogId++;
    const fullLog: CallEntryLog = {
      ...log,
      id,
      createdAt: new Date(),
    };
    this.callEntryLogs.set(id, fullLog);
    return fullLog;
  }

  async getCallEntryLogs(incidentId?: number): Promise<CallEntryLog[]> {
    const logs = Array.from(this.callEntryLogs.values());
    if (incidentId) {
      return logs.filter(log => log.incidentId === incidentId);
    }
    return logs;
  }

  async getCallEntryLogsByUser(userId: number): Promise<CallEntryLog[]> {
    return Array.from(this.callEntryLogs.values()).filter(
      log => log.callTakerId === userId
    );
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const id = this.currentIncidentId++;
    const incident: Incident = {
      ...insertIncident,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.incidents.set(id, incident);
    return incident;
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async getAllIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values());
  }

  async updateIncident(id: number, updates: Partial<Incident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;
    
    const updatedIncident = { ...incident, ...updates, updatedAt: new Date() };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    const id = this.currentUnitId++;
    const unit: Unit = {
      ...insertUnit,
      id,
      updatedAt: new Date(),
    };
    this.units.set(id, unit);
    return unit;
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    return this.units.get(id);
  }

  async getAllUnits(): Promise<Unit[]> {
    return Array.from(this.units.values());
  }

  async updateUnit(id: number, updates: Partial<Unit>): Promise<Unit | undefined> {
    const unit = this.units.get(id);
    if (!unit) return undefined;
    
    const updatedUnit = { ...unit, ...updates, updatedAt: new Date() };
    this.units.set(id, updatedUnit);
    return updatedUnit;
  }

  async assignUnitToIncident(assignment: InsertIncidentUnit): Promise<IncidentUnit> {
    const id = this.currentIncidentUnitId++;
    const incidentUnit: IncidentUnit = {
      ...assignment,
      id,
      assignedAt: new Date(),
    };
    this.incidentUnits.set(id, incidentUnit);
    return incidentUnit;
  }

  async getIncidentUnits(incidentId: number): Promise<IncidentUnit[]> {
    return Array.from(this.incidentUnits.values()).filter(
      iu => iu.incidentId === incidentId
    );
  }

  async getUnitAssignments(unitId: number): Promise<IncidentUnit[]> {
    return Array.from(this.incidentUnits.values()).filter(
      iu => iu.unitId === unitId
    );
  }

  // Animal operations
  async createAnimal(insertAnimal: InsertAnimal): Promise<Animal> {
    const id = this.currentAnimalId++;
    const now = new Date();
    const registrationNumber = `AC-${new Date().getFullYear()}-${id.toString().padStart(4, '0')}`;
    
    const animal: Animal = {
      ...insertAnimal,
      id,
      registrationNumber,
      createdAt: now,
      updatedAt: now,
    };
    
    this.animals.set(id, animal);
    return animal;
  }

  async getAnimal(id: number): Promise<Animal | undefined> {
    return this.animals.get(id);
  }

  async getAllAnimals(): Promise<Animal[]> {
    return Array.from(this.animals.values());
  }

  async updateAnimal(id: number, updates: Partial<Animal>): Promise<Animal | undefined> {
    const animal = this.animals.get(id);
    if (!animal) return undefined;
    
    const updatedAnimal = { ...animal, ...updates, updatedAt: new Date() };
    this.animals.set(id, updatedAnimal);
    return updatedAnimal;
  }

  async getAnimalsByOwner(ownerName: string): Promise<Animal[]> {
    return Array.from(this.animals.values()).filter(
      animal => animal.ownerName?.toLowerCase().includes(ownerName.toLowerCase())
    );
  }

  // Enforcement report operations
  async createEnforcementReport(insertReport: InsertEnforcementReport): Promise<EnforcementReport> {
    const id = this.currentEnforcementReportId++;
    const now = new Date();
    
    const report: EnforcementReport = {
      ...insertReport,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.enforcementReports.set(id, report);
    return report;
  }

  async getEnforcementReport(id: number): Promise<EnforcementReport | undefined> {
    return this.enforcementReports.get(id);
  }

  async getAllEnforcementReports(): Promise<EnforcementReport[]> {
    return Array.from(this.enforcementReports.values());
  }

  async updateEnforcementReport(id: number, updates: Partial<EnforcementReport>): Promise<EnforcementReport | undefined> {
    const report = this.enforcementReports.get(id);
    if (!report) return undefined;
    
    const updatedReport = { ...report, ...updates, updatedAt: new Date() };
    this.enforcementReports.set(id, updatedReport);
    return updatedReport;
  }

  // Customer methods
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customerId = insertCustomer.customerId || `CUS-${new Date().getFullYear()}-${String(id).padStart(6, '0')}`;
    
    const customer: Customer = {
      ...insertCustomer,
      id,
      customerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...updates, updatedAt: new Date() };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    if (!query.trim()) return this.getAllCustomers();
    
    const searchLower = query.toLowerCase();
    return Array.from(this.customers.values()).filter(customer => 
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.customerId.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.homePhone?.includes(query) ||
      customer.workPhone?.includes(query) ||
      customer.address?.toLowerCase().includes(searchLower) ||
      customer.driverLicenseNumber?.toLowerCase().includes(searchLower) ||
      customer.notes?.toLowerCase().includes(searchLower)
    );
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;
    
    const updated: Document = { ...existing, ...updates, updatedAt: new Date() };
    this.documents.set(id, updated);
    return updated;
  }

  async getDocumentByUid(uid: string): Promise<Document | undefined> {
    return Array.from(this.documents.values()).find(doc => doc.uid === uid);
  }

  // Invoice operations
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      invoiceNumber: insertInvoice.invoiceNumber || `INV-${id.toString().padStart(4, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const existing = this.invoices.get(id);
    if (!existing) return undefined;
    
    const updated: Invoice = { ...existing, ...updates, updatedAt: new Date() };
    this.invoices.set(id, updated);
    return updated;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(invoice => invoice.invoiceNumber === invoiceNumber);
  }

  // Payment operations
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = {
      ...insertPayment,
      id,
      paymentId: insertPayment.paymentId || `PAY-${id.toString().padStart(4, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined> {
    const existing = this.payments.get(id);
    if (!existing) return undefined;
    
    const updated: Payment = { ...existing, ...updates, updatedAt: new Date() };
    this.payments.set(id, updated);
    return updated;
  }

  async getPaymentByPaymentId(paymentId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => payment.paymentId === paymentId);
  }

  async getPaymentsByInvoiceId(invoiceId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.invoiceId === invoiceId);
  }

  // POS Transaction operations
  async createPosTransaction(insertTransaction: InsertPosTransaction): Promise<PosTransaction> {
    const id = this.currentPosTransactionId++;
    const transaction: PosTransaction = {
      ...insertTransaction,
      id,
      transactionId: insertTransaction.transactionId || `POS-${id.toString().padStart(4, '0')}`,
      receiptNumber: insertTransaction.receiptNumber || `R-${id.toString().padStart(6, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posTransactions.set(id, transaction);
    return transaction;
  }

  async getPosTransaction(id: number): Promise<PosTransaction | undefined> {
    return this.posTransactions.get(id);
  }

  async getAllPosTransactions(): Promise<PosTransaction[]> {
    return Array.from(this.posTransactions.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async updatePosTransaction(id: number, updates: Partial<PosTransaction>): Promise<PosTransaction | undefined> {
    const existing = this.posTransactions.get(id);
    if (!existing) return undefined;
    
    const updated: PosTransaction = { ...existing, ...updates, updatedAt: new Date() };
    this.posTransactions.set(id, updated);
    return updated;
  }

  async getPosTransactionByTransactionId(transactionId: string): Promise<PosTransaction | undefined> {
    return Array.from(this.posTransactions.values()).find(transaction => transaction.transactionId === transactionId);
  }

  // BeaverRisk CRUD methods
  // Risk Location operations
  async createRiskLocation(insertLocation: InsertRiskLocation): Promise<RiskLocation> {
    const id = this.currentRiskLocationId++;
    const location: RiskLocation = {
      ...insertLocation,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.riskLocations.set(id, location);
    return location;
  }

  async getRiskLocation(id: number): Promise<RiskLocation | undefined> {
    return this.riskLocations.get(id);
  }

  async getAllRiskLocations(): Promise<RiskLocation[]> {
    return Array.from(this.riskLocations.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateRiskLocation(id: number, updates: Partial<RiskLocation>): Promise<RiskLocation | undefined> {
    const existing = this.riskLocations.get(id);
    if (!existing) return undefined;
    
    const updated: RiskLocation = { ...existing, ...updates, updatedAt: new Date() };
    this.riskLocations.set(id, updated);
    return updated;
  }

  // Risk Assessment operations
  async createRiskAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const id = this.currentRiskAssessmentId++;
    const assessment: RiskAssessment = {
      ...insertAssessment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.riskAssessments.set(id, assessment);
    return assessment;
  }

  async getRiskAssessment(id: number): Promise<RiskAssessment | undefined> {
    return this.riskAssessments.get(id);
  }

  async getAllRiskAssessments(): Promise<RiskAssessment[]> {
    return Array.from(this.riskAssessments.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async updateRiskAssessment(id: number, updates: Partial<RiskAssessment>): Promise<RiskAssessment | undefined> {
    const existing = this.riskAssessments.get(id);
    if (!existing) return undefined;
    
    const updated: RiskAssessment = { ...existing, ...updates, updatedAt: new Date() };
    this.riskAssessments.set(id, updated);
    return updated;
  }

  // Mitigation Plan operations
  async createMitigationPlan(insertPlan: InsertMitigationPlan): Promise<MitigationPlan> {
    const id = this.currentMitigationPlanId++;
    const plan: MitigationPlan = {
      ...insertPlan,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mitigationPlans.set(id, plan);
    return plan;
  }

  async getMitigationPlan(id: number): Promise<MitigationPlan | undefined> {
    return this.mitigationPlans.get(id);
  }

  async getAllMitigationPlans(): Promise<MitigationPlan[]> {
    return Array.from(this.mitigationPlans.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async updateMitigationPlan(id: number, updates: Partial<MitigationPlan>): Promise<MitigationPlan | undefined> {
    const existing = this.mitigationPlans.get(id);
    if (!existing) return undefined;
    
    const updated: MitigationPlan = { ...existing, ...updates, updatedAt: new Date() };
    this.mitigationPlans.set(id, updated);
    return updated;
  }

  async getMitigationPlansByRiskAssessment(riskAssessmentId: number): Promise<MitigationPlan[]> {
    return Array.from(this.mitigationPlans.values()).filter(plan => plan.riskAssessmentId === riskAssessmentId);
  }

  // Risk Event operations
  async createRiskEvent(insertEvent: InsertRiskEvent): Promise<RiskEvent> {
    const id = this.currentRiskEventId++;
    const event: RiskEvent = {
      ...insertEvent,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.riskEvents.set(id, event);
    return event;
  }

  async getRiskEvent(id: number): Promise<RiskEvent | undefined> {
    return this.riskEvents.get(id);
  }

  async getAllRiskEvents(): Promise<RiskEvent[]> {
    return Array.from(this.riskEvents.values()).sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
  }

  async updateRiskEvent(id: number, updates: Partial<RiskEvent>): Promise<RiskEvent | undefined> {
    const existing = this.riskEvents.get(id);
    if (!existing) return undefined;
    
    const updated: RiskEvent = { ...existing, ...updates, updatedAt: new Date() };
    this.riskEvents.set(id, updated);
    return updated;
  }

  async getRiskEventsByAssessment(riskAssessmentId: number): Promise<RiskEvent[]> {
    return Array.from(this.riskEvents.values()).filter(event => event.riskAssessmentId === riskAssessmentId);
  }

  // BeaverAudit operations implementations
  // Audit Schedule operations
  async createAuditSchedule(insertSchedule: InsertAuditSchedule): Promise<AuditSchedule> {
    const id = this.currentAuditScheduleId++;
    const schedule: AuditSchedule = {
      ...insertSchedule,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.auditSchedules.set(id, schedule);
    return schedule;
  }

  async getAuditSchedule(id: number): Promise<AuditSchedule | undefined> {
    return this.auditSchedules.get(id);
  }

  async getAllAuditSchedules(): Promise<AuditSchedule[]> {
    return Array.from(this.auditSchedules.values());
  }

  async updateAuditSchedule(id: number, updates: Partial<AuditSchedule>): Promise<AuditSchedule | undefined> {
    const existing = this.auditSchedules.get(id);
    if (!existing) return undefined;
    const updated: AuditSchedule = { ...existing, ...updates, updatedAt: new Date() };
    this.auditSchedules.set(id, updated);
    return updated;
  }

  async getAuditSchedulesByInspector(inspectorId: string): Promise<AuditSchedule[]> {
    return Array.from(this.auditSchedules.values()).filter(schedule => schedule.inspectorId === inspectorId);
  }

  // Audit Template operations
  async createAuditTemplate(insertTemplate: InsertAuditTemplate): Promise<AuditTemplate> {
    const id = this.currentAuditTemplateId++;
    const template: AuditTemplate = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.auditTemplates.set(id, template);
    return template;
  }

  async getAuditTemplate(id: number): Promise<AuditTemplate | undefined> {
    return this.auditTemplates.get(id);
  }

  async getAllAuditTemplates(): Promise<AuditTemplate[]> {
    return Array.from(this.auditTemplates.values());
  }

  async updateAuditTemplate(id: number, updates: Partial<AuditTemplate>): Promise<AuditTemplate | undefined> {
    const existing = this.auditTemplates.get(id);
    if (!existing) return undefined;
    const updated: AuditTemplate = { ...existing, ...updates, updatedAt: new Date() };
    this.auditTemplates.set(id, updated);
    return updated;
  }

  async getAuditTemplatesByType(facilityType: string, missionType: string): Promise<AuditTemplate[]> {
    return Array.from(this.auditTemplates.values()).filter(template => 
      template.facilityType === facilityType && template.missionType === missionType
    );
  }

  // Audit Report operations
  async createAuditReport(insertReport: InsertAuditReport): Promise<AuditReport> {
    const id = this.currentAuditReportId++;
    const report: AuditReport = {
      ...insertReport,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.auditReports.set(id, report);
    return report;
  }

  async getAuditReport(id: number): Promise<AuditReport | undefined> {
    return this.auditReports.get(id);
  }

  async getAllAuditReports(): Promise<AuditReport[]> {
    return Array.from(this.auditReports.values());
  }

  async updateAuditReport(id: number, updates: Partial<AuditReport>): Promise<AuditReport | undefined> {
    const existing = this.auditReports.get(id);
    if (!existing) return undefined;
    const updated: AuditReport = { ...existing, ...updates, updatedAt: new Date() };
    this.auditReports.set(id, updated);
    return updated;
  }

  async getAuditReportsBySchedule(scheduleId: number): Promise<AuditReport[]> {
    return Array.from(this.auditReports.values()).filter(report => report.scheduleId === scheduleId);
  }

  async getAuditReportsByInspector(inspectorId: string): Promise<AuditReport[]> {
    return Array.from(this.auditReports.values()).filter(report => report.inspectorId === inspectorId);
  }

  // Audit Non-Compliance operations
  async createAuditNonCompliance(insertNonCompliance: InsertAuditNonCompliance): Promise<AuditNonCompliance> {
    const id = this.currentAuditNonComplianceId++;
    const nonCompliance: AuditNonCompliance = {
      ...insertNonCompliance,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.auditNonCompliances.set(id, nonCompliance);
    return nonCompliance;
  }

  async getAuditNonCompliance(id: number): Promise<AuditNonCompliance | undefined> {
    return this.auditNonCompliances.get(id);
  }

  async getAllAuditNonCompliances(): Promise<AuditNonCompliance[]> {
    return Array.from(this.auditNonCompliances.values());
  }

  async updateAuditNonCompliance(id: number, updates: Partial<AuditNonCompliance>): Promise<AuditNonCompliance | undefined> {
    const existing = this.auditNonCompliances.get(id);
    if (!existing) return undefined;
    const updated: AuditNonCompliance = { ...existing, ...updates, updatedAt: new Date() };
    this.auditNonCompliances.set(id, updated);
    return updated;
  }

  async getAuditNonCompliancesByReport(auditReportId: number): Promise<AuditNonCompliance[]> {
    return Array.from(this.auditNonCompliances.values()).filter(nc => nc.auditReportId === auditReportId);
  }

  async getAuditNonCompliancesByStatus(status: string): Promise<AuditNonCompliance[]> {
    return Array.from(this.auditNonCompliances.values()).filter(nc => nc.status === status);
  }

  // Audit Evidence operations
  async createAuditEvidence(insertEvidence: InsertAuditEvidence): Promise<AuditEvidence> {
    const id = this.currentAuditEvidenceId++;
    const evidence: AuditEvidence = {
      ...insertEvidence,
      id,
      createdAt: new Date(),
    };
    this.auditEvidence.set(id, evidence);
    return evidence;
  }

  async getAuditEvidence(id: number): Promise<AuditEvidence | undefined> {
    return this.auditEvidence.get(id);
  }

  async getAllAuditEvidence(): Promise<AuditEvidence[]> {
    return Array.from(this.auditEvidence.values());
  }

  async updateAuditEvidence(id: number, updates: Partial<AuditEvidence>): Promise<AuditEvidence | undefined> {
    const existing = this.auditEvidence.get(id);
    if (!existing) return undefined;
    const updated: AuditEvidence = { ...existing, ...updates };
    this.auditEvidence.set(id, updated);
    return updated;
  }

  async getAuditEvidenceByReport(auditReportId: number): Promise<AuditEvidence[]> {
    return Array.from(this.auditEvidence.values()).filter(evidence => evidence.auditReportId === auditReportId);
  }

  async getAuditEvidenceByNonCompliance(nonComplianceId: number): Promise<AuditEvidence[]> {
    return Array.from(this.auditEvidence.values()).filter(evidence => evidence.nonComplianceId === nonComplianceId);
  }

  // BeaverDMV Implementation Methods
  // Character operations
  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.currentCharacterId++;
    const character: Character = {
      ...insertCharacter,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.characters.set(id, character);
    return character;
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined> {
    const existing = this.characters.get(id);
    if (!existing) return undefined;
    const updated: Character = { ...existing, ...updates, updatedAt: new Date() };
    this.characters.set(id, updated);
    return updated;
  }

  async searchCharacters(query: string): Promise<Character[]> {
    const searchLower = query.toLowerCase();
    return Array.from(this.characters.values()).filter(character =>
      character.firstName?.toLowerCase().includes(searchLower) ||
      character.lastName?.toLowerCase().includes(searchLower) ||
      character.phone?.toLowerCase().includes(searchLower) ||
      character.email?.toLowerCase().includes(searchLower)
    );
  }

  async getCharacterBySyncId(syncId: string): Promise<Character | undefined> {
    return Array.from(this.characters.values()).find(character => character.syncId === syncId);
  }

  // License operations
  async createLicense(insertLicense: InsertLicense): Promise<License> {
    const id = this.currentLicenseId++;
    const license: License = {
      ...insertLicense,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.licenses.set(id, license);
    return license;
  }

  async getLicense(id: number): Promise<License | undefined> {
    return this.licenses.get(id);
  }

  async getAllLicenses(): Promise<License[]> {
    return Array.from(this.licenses.values());
  }

  async updateLicense(id: number, updates: Partial<License>): Promise<License | undefined> {
    const existing = this.licenses.get(id);
    if (!existing) return undefined;
    const updated: License = { ...existing, ...updates, updatedAt: new Date() };
    this.licenses.set(id, updated);
    return updated;
  }

  async getLicenseByNumber(licenseNumber: string): Promise<License | undefined> {
    return Array.from(this.licenses.values()).find(license => license.licenseNumber === licenseNumber);
  }

  async getLicensesByCharacterId(characterId: number): Promise<License[]> {
    return Array.from(this.licenses.values()).filter(license => license.characterId === characterId);
  }

  async getLicensesByOwner(owner: string): Promise<License[]> {
    return Array.from(this.licenses.values()).filter(license => license.owner === owner);
  }

  // Vehicle Registration operations
  async createVehicleRegistration(insertRegistration: InsertVehicleRegistration): Promise<VehicleRegistration> {
    const id = this.currentVehicleRegistrationId++;
    const registration: VehicleRegistration = {
      ...insertRegistration,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicleRegistrations.set(id, registration);
    return registration;
  }

  async getVehicleRegistration(id: number): Promise<VehicleRegistration | undefined> {
    return this.vehicleRegistrations.get(id);
  }

  async getAllVehicleRegistrations(): Promise<VehicleRegistration[]> {
    return Array.from(this.vehicleRegistrations.values());
  }

  async updateVehicleRegistration(id: number, updates: Partial<VehicleRegistration>): Promise<VehicleRegistration | undefined> {
    const existing = this.vehicleRegistrations.get(id);
    if (!existing) return undefined;
    const updated: VehicleRegistration = { ...existing, ...updates, updatedAt: new Date() };
    this.vehicleRegistrations.set(id, updated);
    return updated;
  }

  async getVehicleRegistrationByPlate(plate: string): Promise<VehicleRegistration | undefined> {
    return Array.from(this.vehicleRegistrations.values()).find(registration => registration.plate === plate);
  }

  async getVehicleRegistrationByVin(vin: string): Promise<VehicleRegistration | undefined> {
    return Array.from(this.vehicleRegistrations.values()).find(registration => registration.vin === vin);
  }

  async getVehicleRegistrationsByCharacterId(characterId: number): Promise<VehicleRegistration[]> {
    return Array.from(this.vehicleRegistrations.values()).filter(registration => registration.characterId === characterId);
  }

  async getVehicleRegistrationsByOwner(owner: string): Promise<VehicleRegistration[]> {
    return Array.from(this.vehicleRegistrations.values()).filter(registration => registration.owner === owner);
  }


}

import { db } from "./db";
import { eq, like, or, and, desc, asc } from "drizzle-orm";
import { 
  users, 
  incidents, 
  units, 
  incidentUnits, 
  animals, 
  enforcementReports, 
  customers, 
  documents, 
  invoices, 
  payments, 
  posTransactions, 
  riskLocations, 
  riskAssessments, 
  mitigationPlans, 
  riskEvents, 
  auditSchedules, 
  auditTemplates, 
  auditReports, 
  auditNonCompliances, 
  auditEvidence, 
  characters, 
  licenses, 
  vehicleRegistrations, 
  callEntryLogs
} from "@shared/schema";

class DatabaseStorage implements IStorage {

  // Keep all other methods from MemStorage as fallback
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }

  async updateUserProfile(id: number, profileData: UpdateUserProfile): Promise<User | undefined> {
    const [updated] = await db.update(users).set(profileData).where(eq(users.id, id)).returning();
    return updated;
  }

  async verifyEmployeePin(userId: number, pin: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user?.employeePin === pin;
  }

  async verifyChipCard(chipCardId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.chipCardId, chipCardId));
    return user;
  }

  // Placeholder implementations for other methods - extend as needed
  async createCallEntryLog(log: InsertCallEntryLog): Promise<CallEntryLog> {
    const [result] = await db.insert(callEntryLogs).values(log).returning();
    return result;
  }

  async getCallEntryLogs(incidentId?: number): Promise<CallEntryLog[]> {
    if (incidentId) {
      return await db.select().from(callEntryLogs).where(eq(callEntryLogs.incidentId, incidentId));
    }
    return await db.select().from(callEntryLogs);
  }

  async getCallEntryLogsByUser(userId: number): Promise<CallEntryLog[]> {
    return await db.select().from(callEntryLogs).where(eq(callEntryLogs.userId, userId));
  }

  // For now, use fallback implementations for other methods
  private memStorage = new MemStorage();
  
  async createIncident(incident: InsertIncident): Promise<Incident> {
    return this.memStorage.createIncident(incident);
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    return this.memStorage.getIncident(id);
  }

  async getAllIncidents(): Promise<Incident[]> {
    return this.memStorage.getAllIncidents();
  }

  async updateIncident(id: number, updates: Partial<Incident>): Promise<Incident | undefined> {
    return this.memStorage.updateIncident(id, updates);
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    return this.memStorage.createUnit(unit);
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    return this.memStorage.getUnit(id);
  }

  async getAllUnits(): Promise<Unit[]> {
    return this.memStorage.getAllUnits();
  }

  async updateUnit(id: number, updates: Partial<Unit>): Promise<Unit | undefined> {
    return this.memStorage.updateUnit(id, updates);
  }

  async assignUnitToIncident(assignment: InsertIncidentUnit): Promise<IncidentUnit> {
    return this.memStorage.assignUnitToIncident(assignment);
  }

  async getIncidentUnits(incidentId: number): Promise<IncidentUnit[]> {
    return this.memStorage.getIncidentUnits(incidentId);
  }

  async getUnitAssignments(unitId: number): Promise<IncidentUnit[]> {
    return this.memStorage.getUnitAssignments(unitId);
  }

  async createAnimal(animal: InsertAnimal): Promise<Animal> {
    return this.memStorage.createAnimal(animal);
  }

  async getAnimal(id: number): Promise<Animal | undefined> {
    return this.memStorage.getAnimal(id);
  }

  async getAllAnimals(): Promise<Animal[]> {
    return this.memStorage.getAllAnimals();
  }

  async updateAnimal(id: number, updates: Partial<Animal>): Promise<Animal | undefined> {
    return this.memStorage.updateAnimal(id, updates);
  }

  async getAnimalsByOwner(ownerName: string): Promise<Animal[]> {
    return this.memStorage.getAnimalsByOwner(ownerName);
  }

  async createEnforcementReport(report: InsertEnforcementReport): Promise<EnforcementReport> {
    return this.memStorage.createEnforcementReport(report);
  }

  async getEnforcementReport(id: number): Promise<EnforcementReport | undefined> {
    return this.memStorage.getEnforcementReport(id);
  }

  async getAllEnforcementReports(): Promise<EnforcementReport[]> {
    return this.memStorage.getAllEnforcementReports();
  }

  async updateEnforcementReport(id: number, updates: Partial<EnforcementReport>): Promise<EnforcementReport | undefined> {
    return this.memStorage.updateEnforcementReport(id, updates);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    return this.memStorage.createCustomer(customer);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.memStorage.getCustomer(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.memStorage.getAllCustomers();
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined> {
    return this.memStorage.updateCustomer(id, updates);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return this.memStorage.searchCustomers(query);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    return this.memStorage.createDocument(document);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.memStorage.getDocument(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return this.memStorage.getAllDocuments();
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    return this.memStorage.updateDocument(id, updates);
  }

  async getDocumentByUid(uid: string): Promise<Document | undefined> {
    return this.memStorage.getDocumentByUid(uid);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    return this.memStorage.createInvoice(invoice);
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.memStorage.getInvoice(id);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return this.memStorage.getAllInvoices();
  }

  async updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    return this.memStorage.updateInvoice(id, updates);
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    return this.memStorage.getInvoiceByNumber(invoiceNumber);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    return this.memStorage.createPayment(payment);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.memStorage.getPayment(id);
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.memStorage.getAllPayments();
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined> {
    return this.memStorage.updatePayment(id, updates);
  }

  async createPosTransaction(transaction: InsertPosTransaction): Promise<PosTransaction> {
    return this.memStorage.createPosTransaction(transaction);
  }

  async getPosTransaction(id: number): Promise<PosTransaction | undefined> {
    return this.memStorage.getPosTransaction(id);
  }

  async getAllPosTransactions(): Promise<PosTransaction[]> {
    return this.memStorage.getAllPosTransactions();
  }

  async updatePosTransaction(id: number, updates: Partial<PosTransaction>): Promise<PosTransaction | undefined> {
    return this.memStorage.updatePosTransaction(id, updates);
  }

  async createRiskLocation(location: InsertRiskLocation): Promise<RiskLocation> {
    return this.memStorage.createRiskLocation(location);
  }

  async getRiskLocation(id: number): Promise<RiskLocation | undefined> {
    return this.memStorage.getRiskLocation(id);
  }

  async getAllRiskLocations(): Promise<RiskLocation[]> {
    return this.memStorage.getAllRiskLocations();
  }

  async updateRiskLocation(id: number, updates: Partial<RiskLocation>): Promise<RiskLocation | undefined> {
    return this.memStorage.updateRiskLocation(id, updates);
  }

  async createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment> {
    return this.memStorage.createRiskAssessment(assessment);
  }

  async getRiskAssessment(id: number): Promise<RiskAssessment | undefined> {
    return this.memStorage.getRiskAssessment(id);
  }

  async getAllRiskAssessments(): Promise<RiskAssessment[]> {
    return this.memStorage.getAllRiskAssessments();
  }

  async updateRiskAssessment(id: number, updates: Partial<RiskAssessment>): Promise<RiskAssessment | undefined> {
    return this.memStorage.updateRiskAssessment(id, updates);
  }

  async createMitigationPlan(plan: InsertMitigationPlan): Promise<MitigationPlan> {
    return this.memStorage.createMitigationPlan(plan);
  }

  async getMitigationPlan(id: number): Promise<MitigationPlan | undefined> {
    return this.memStorage.getMitigationPlan(id);
  }

  async getAllMitigationPlans(): Promise<MitigationPlan[]> {
    return this.memStorage.getAllMitigationPlans();
  }

  async updateMitigationPlan(id: number, updates: Partial<MitigationPlan>): Promise<MitigationPlan | undefined> {
    return this.memStorage.updateMitigationPlan(id, updates);
  }

  async getMitigationPlansByRiskAssessment(riskAssessmentId: number): Promise<MitigationPlan[]> {
    return this.memStorage.getMitigationPlansByRiskAssessment(riskAssessmentId);
  }

  async createRiskEvent(event: InsertRiskEvent): Promise<RiskEvent> {
    return this.memStorage.createRiskEvent(event);
  }

  async getRiskEvent(id: number): Promise<RiskEvent | undefined> {
    return this.memStorage.getRiskEvent(id);
  }

  async getAllRiskEvents(): Promise<RiskEvent[]> {
    return this.memStorage.getAllRiskEvents();
  }

  async updateRiskEvent(id: number, updates: Partial<RiskEvent>): Promise<RiskEvent | undefined> {
    return this.memStorage.updateRiskEvent(id, updates);
  }

  async getRiskEventsByAssessment(assessmentId: number): Promise<RiskEvent[]> {
    return this.memStorage.getRiskEventsByAssessment(assessmentId);
  }

  async createAuditSchedule(schedule: InsertAuditSchedule): Promise<AuditSchedule> {
    return this.memStorage.createAuditSchedule(schedule);
  }

  async getAuditSchedule(id: number): Promise<AuditSchedule | undefined> {
    return this.memStorage.getAuditSchedule(id);
  }

  async getAllAuditSchedules(): Promise<AuditSchedule[]> {
    return this.memStorage.getAllAuditSchedules();
  }

  async updateAuditSchedule(id: number, updates: Partial<AuditSchedule>): Promise<AuditSchedule | undefined> {
    return this.memStorage.updateAuditSchedule(id, updates);
  }

  async createAuditTemplate(template: InsertAuditTemplate): Promise<AuditTemplate> {
    return this.memStorage.createAuditTemplate(template);
  }

  async getAuditTemplate(id: number): Promise<AuditTemplate | undefined> {
    return this.memStorage.getAuditTemplate(id);
  }

  async getAllAuditTemplates(): Promise<AuditTemplate[]> {
    return this.memStorage.getAllAuditTemplates();
  }

  async createAuditReport(report: InsertAuditReport): Promise<AuditReport> {
    return this.memStorage.createAuditReport(report);
  }

  async getAuditReport(id: number): Promise<AuditReport | undefined> {
    return this.memStorage.getAuditReport(id);
  }

  async getAllAuditReports(): Promise<AuditReport[]> {
    return this.memStorage.getAllAuditReports();
  }

  async updateAuditReport(id: number, updates: Partial<AuditReport>): Promise<AuditReport | undefined> {
    return this.memStorage.updateAuditReport(id, updates);
  }

  async createAuditNonCompliance(nonCompliance: InsertAuditNonCompliance): Promise<AuditNonCompliance> {
    return this.memStorage.createAuditNonCompliance(nonCompliance);
  }

  async getAuditNonCompliance(id: number): Promise<AuditNonCompliance | undefined> {
    return this.memStorage.getAuditNonCompliance(id);
  }

  async getAllAuditNonCompliances(): Promise<AuditNonCompliance[]> {
    return this.memStorage.getAllAuditNonCompliances();
  }

  async updateAuditNonCompliance(id: number, updates: Partial<AuditNonCompliance>): Promise<AuditNonCompliance | undefined> {
    return this.memStorage.updateAuditNonCompliance(id, updates);
  }

  async createAuditEvidence(evidence: InsertAuditEvidence): Promise<AuditEvidence> {
    return this.memStorage.createAuditEvidence(evidence);
  }

  async getAuditEvidence(id: number): Promise<AuditEvidence | undefined> {
    return this.memStorage.getAuditEvidence(id);
  }

  async getAllAuditEvidences(): Promise<AuditEvidence[]> {
    return this.memStorage.getAllAuditEvidences();
  }

  async updateAuditEvidence(id: number, updates: Partial<AuditEvidence>): Promise<AuditEvidence | undefined> {
    return this.memStorage.updateAuditEvidence(id, updates);
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    return this.memStorage.createCharacter(character);
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.memStorage.getCharacter(id);
  }

  async getAllCharacters(): Promise<Character[]> {
    return this.memStorage.getAllCharacters();
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined> {
    return this.memStorage.updateCharacter(id, updates);
  }

  async createLicense(license: InsertLicense): Promise<License> {
    return this.memStorage.createLicense(license);
  }

  async getLicense(id: number): Promise<License | undefined> {
    return this.memStorage.getLicense(id);
  }

  async getAllLicenses(): Promise<License[]> {
    return this.memStorage.getAllLicenses();
  }

  async updateLicense(id: number, updates: Partial<License>): Promise<License | undefined> {
    return this.memStorage.updateLicense(id, updates);
  }

  async getLicenseByNumber(licenseNumber: string): Promise<License | undefined> {
    return this.memStorage.getLicenseByNumber(licenseNumber);
  }

  async createVehicleRegistration(registration: InsertVehicleRegistration): Promise<VehicleRegistration> {
    return this.memStorage.createVehicleRegistration(registration);
  }

  async getVehicleRegistration(id: number): Promise<VehicleRegistration | undefined> {
    return this.memStorage.getVehicleRegistration(id);
  }

  async getAllVehicleRegistrations(): Promise<VehicleRegistration[]> {
    return this.memStorage.getAllVehicleRegistrations();
  }

  async updateVehicleRegistration(id: number, updates: Partial<VehicleRegistration>): Promise<VehicleRegistration | undefined> {
    return this.memStorage.updateVehicleRegistration(id, updates);
  }

  async getVehicleRegistrationByPlate(plate: string): Promise<VehicleRegistration | undefined> {
    return this.memStorage.getVehicleRegistrationByPlate(plate);
  }

  async getVehicleRegistrationByVin(vin: string): Promise<VehicleRegistration | undefined> {
    return this.memStorage.getVehicleRegistrationByVin(vin);
  }

  async getVehicleRegistrationsByCharacterId(characterId: number): Promise<VehicleRegistration[]> {
    return this.memStorage.getVehicleRegistrationsByCharacterId(characterId);
  }

  async getVehicleRegistrationsByOwner(owner: string): Promise<VehicleRegistration[]> {
    return this.memStorage.getVehicleRegistrationsByOwner(owner);
  }
}

export const storage = new DatabaseStorage();
