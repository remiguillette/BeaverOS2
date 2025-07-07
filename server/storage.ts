import { users, type User, type InsertUser, type Incident, type InsertIncident, type Unit, type InsertUnit, type IncidentUnit, type InsertIncidentUnit, type Animal, type InsertAnimal, type EnforcementReport, type InsertEnforcementReport, type Customer, type InsertCustomer, type Document, type InsertDocument } from "@shared/schema";

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
  private currentUserId: number;
  private currentIncidentId: number;
  private currentUnitId: number;
  private currentIncidentUnitId: number;
  private currentAnimalId: number;
  private currentEnforcementReportId: number;
  private currentCustomerId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.incidents = new Map();
    this.units = new Map();
    this.incidentUnits = new Map();
    this.animals = new Map();
    this.enforcementReports = new Map();
    this.customers = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
    this.currentIncidentId = 1;
    this.currentUnitId = 1;
    this.currentIncidentUnitId = 1;
    this.currentAnimalId = 1;
    this.currentEnforcementReportId = 1;
    this.currentCustomerId = 1;
    this.currentDocumentId = 1;
    
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
}

export const storage = new MemStorage();
