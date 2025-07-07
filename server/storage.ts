import { users, type User, type InsertUser, type Incident, type InsertIncident, type Unit, type InsertUnit, type IncidentUnit, type InsertIncidentUnit, type Animal, type InsertAnimal, type EnforcementReport, type InsertEnforcementReport, type Customer, type InsertCustomer, type Document, type InsertDocument, type Invoice, type InsertInvoice, type Payment, type InsertPayment, type PosTransaction, type InsertPosTransaction, type RiskLocation, type InsertRiskLocation, type RiskAssessment, type InsertRiskAssessment, type MitigationPlan, type InsertMitigationPlan, type RiskEvent, type InsertRiskEvent } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample units
    const sampleUnits = [
      { unitNumber: "P-101", type: "police", status: "available", currentLocation: "Downtown Station", latitude: 45.5152, longitude: -122.6784 },
      { unitNumber: "P-102", type: "police", status: "responding", currentLocation: "Oak Street", latitude: 45.5165, longitude: -122.6793 },
      { unitNumber: "P-103", type: "police", status: "busy", currentLocation: "Traffic Stop - Main St", latitude: 45.5140, longitude: -122.6750 },
      { unitNumber: "F-201", type: "fire", status: "available", currentLocation: "Fire Station 1", latitude: 45.5180, longitude: -122.6820 },
      { unitNumber: "F-202", type: "fire", status: "available", currentLocation: "Fire Station 2", latitude: 45.5100, longitude: -122.6700 },
      { unitNumber: "A-301", type: "ambulance", status: "enroute", currentLocation: "Hospital", latitude: 45.5200, longitude: -122.6850 },
      { unitNumber: "A-302", type: "ambulance", status: "available", currentLocation: "Medical Center", latitude: 45.5120, longitude: -122.6680 },
      { unitNumber: "P-104", type: "police", status: "off_duty", currentLocation: "Station", latitude: 45.5152, longitude: -122.6784 },
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

    // Sample incidents
    const sampleIncidents = [
      {
        incidentNumber: "2025-001",
        type: "medical",
        priority: "high",
        status: "active",
        address: "123 Main Street",
        latitude: 45.5140,
        longitude: -122.6750,
        complainant: "John Doe",
        description: "Cardiac arrest, CPR in progress",
        peopleInvolved: 1,
      },
      {
        incidentNumber: "2025-002", 
        type: "fire",
        priority: "high",
        status: "dispatched",
        address: "456 Oak Avenue",
        latitude: 45.5165,
        longitude: -122.6793,
        complainant: "Jane Smith",
        description: "Structure fire, smoke visible",
        peopleInvolved: 3,
      },
      {
        incidentNumber: "2025-003",
        type: "accident",
        priority: "medium",
        status: "new",
        address: "789 Pine Road",
        latitude: 45.5200,
        longitude: -122.6850,
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
