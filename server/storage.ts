import { users, type User, type InsertUser, type Incident, type InsertIncident, type Unit, type InsertUnit, type IncidentUnit, type InsertIncidentUnit } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private incidents: Map<number, Incident>;
  private units: Map<number, Unit>;
  private incidentUnits: Map<number, IncidentUnit>;
  private currentUserId: number;
  private currentIncidentId: number;
  private currentUnitId: number;
  private currentIncidentUnitId: number;

  constructor() {
    this.users = new Map();
    this.incidents = new Map();
    this.units = new Map();
    this.incidentUnits = new Map();
    this.currentUserId = 1;
    this.currentIncidentId = 1;
    this.currentUnitId = 1;
    this.currentIncidentUnitId = 1;
    
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
}

export const storage = new MemStorage();
