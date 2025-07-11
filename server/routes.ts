import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { basicAuth, requireAccessLevel } from "./middleware";
import { insertIncidentSchema, insertUnitSchema, insertIncidentUnitSchema, insertAnimalSchema, insertEnforcementReportSchema, insertCustomerSchema, insertDocumentSchema, insertInvoiceSchema, insertPaymentSchema, insertPosTransactionSchema, insertRiskLocationSchema, insertRiskAssessmentSchema, insertMitigationPlanSchema, insertRiskEventSchema, insertAuditScheduleSchema, insertAuditTemplateSchema, insertAuditReportSchema, insertAuditNonComplianceSchema, insertAuditEvidenceSchema, updateUserProfileSchema, insertCharacterSchema, insertLicenseSchema, insertVehicleRegistrationSchema, insertCallEntryLogSchema } from "@shared/schema";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

export async function registerRoutes(app: Express): Promise<Server> {


  // Authentication endpoint
  app.get("/api/auth/me", basicAuth, (req, res) => {
    // User is already authenticated by middleware
    res.json({ user: req.user });
  });

  // Access control endpoint for protected pages
  app.get("/api/auth/check-access/:page", basicAuth, (req, res) => {
    const page = req.params.page;
    const user = req.user;
    
    if (!user || !user.accessLevel) {
      return res.status(403).json({ 
        hasAccess: false, 
        message: 'Access denied: No access level specified' 
      });
    }

    // Define access requirements for different pages
    const pageAccessRequirements: { [key: string]: string[] } = {
      'beaverpatch': ['SuperAdmin', 'Admin', 'IT Web Support', '911 Supervisor', '911 Dispatcher']
    };

    const requiredLevels = pageAccessRequirements[page];
    
    if (!requiredLevels) {
      return res.json({ hasAccess: true, message: 'No access restrictions for this page' });
    }

    const hasAccess = requiredLevels.includes(user.accessLevel);

    res.json({
      hasAccess,
      userLevel: user.accessLevel,
      requiredLevels,
      message: hasAccess 
        ? 'Access granted' 
        : `Access denied: Requires one of the following access levels: ${requiredLevels.join(', ')}`
    });
  });

  // PIN Authentication endpoint for 911 Dispatchers
  app.post("/api/auth/verify-pin", async (req, res) => {
    try {
      const { userId, pin } = req.body;
      
      if (!userId || !pin) {
        return res.status(400).json({ error: "User ID and PIN are required" });
      }

      const isValid = await storage.verifyEmployeePin(userId, pin);
      
      if (isValid) {
        // Generate session ID for tracking
        const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        res.json({ 
          success: true, 
          sessionId,
          message: "PIN verified successfully" 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: "Invalid PIN" 
        });
      }
    } catch (error) {
      console.error("PIN verification error:", error);
      res.status(500).json({ error: "PIN verification failed" });
    }
  });

  // Chip Card Authentication endpoint
  app.post("/api/auth/verify-chip-card", async (req, res) => {
    try {
      const { chipCardId } = req.body;
      
      if (!chipCardId) {
        return res.status(400).json({ error: "Chip card ID is required" });
      }

      const user = await storage.verifyChipCard(chipCardId);
      
      if (user) {
        // Generate session ID for tracking
        const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        res.json({ 
          success: true, 
          sessionId,
          user: {
            id: user.id,
            username: user.username,
            name: `${user.firstName} ${user.lastName}`,
            accessLevel: user.accessLevel,
            department: user.department,
            position: user.position
          },
          message: "Chip card verified successfully" 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: "Invalid chip card" 
        });
      }
    } catch (error) {
      console.error("Chip card verification error:", error);
      res.status(500).json({ error: "Chip card verification failed" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", authenticated: true });
  });





  // Call entry log endpoints
  app.post("/api/call-entry-logs", async (req, res) => {
    try {
      const validatedData = insertCallEntryLogSchema.parse(req.body);
      const log = await storage.createCallEntryLog(validatedData);
      res.json(log);
    } catch (error) {
      console.error("Call entry log creation error:", error);
      res.status(400).json({ error: "Invalid call entry log data" });
    }
  });

  app.get("/api/call-entry-logs", async (req, res) => {
    try {
      const incidentId = req.query.incidentId ? parseInt(req.query.incidentId as string) : undefined;
      const logs = await storage.getCallEntryLogs(incidentId);
      res.json(logs);
    } catch (error) {
      console.error("Call entry logs fetch error:", error);
      res.status(500).json({ error: "Failed to fetch call entry logs" });
    }
  });

  app.get("/api/call-entry-logs/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const logs = await storage.getCallEntryLogsByUser(userId);
      res.json(logs);
    } catch (error) {
      console.error("User call entry logs fetch error:", error);
      res.status(500).json({ error: "Failed to fetch user call entry logs" });
    }
  });

  // User profile endpoints
  app.get("/api/user/profile", async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Remove password from response
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    try {
      const validatedData = updateUserProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(req.user!.id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      // Remove password from response
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  // Incident endpoints
  app.get("/api/incidents", async (req, res) => {
    try {
      const incidents = await storage.getAllIncidents();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  app.get("/api/incidents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const incident = await storage.getIncident(id);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incident" });
    }
  });

  app.post("/api/incidents", async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: "Invalid incident data" });
    }
  });

  app.patch("/api/incidents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const incident = await storage.updateIncident(id, req.body);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to update incident" });
    }
  });

  // Unit endpoints
  app.get("/api/units", async (req, res) => {
    try {
      const units = await storage.getAllUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch units" });
    }
  });

  app.get("/api/units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const unit = await storage.getUnit(id);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unit" });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const validatedData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(validatedData);
      res.json(unit);
    } catch (error) {
      res.status(400).json({ error: "Invalid unit data" });
    }
  });

  app.patch("/api/units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const unit = await storage.updateUnit(id, req.body);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      res.status(500).json({ error: "Failed to update unit" });
    }
  });

  // Unit status management endpoints
  app.post("/api/units/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["available", "dispatched", "responding", "enroute", "busy", "off_duty"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updates: any = { status };
      
      // If setting to available, clear assigned incident
      if (status === "available") {
        updates.assignedIncidentId = null;
      }
      
      const unit = await storage.updateUnit(id, updates);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      res.status(500).json({ error: "Failed to update unit status" });
    }
  });

  // Incident status management endpoints
  app.post("/api/incidents/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["new", "dispatched", "active", "resolved"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const incident = await storage.updateIncident(id, { status });
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      
      // If incident is resolved, set assigned units back to available
      if (status === "resolved") {
        const assignedUnits = await storage.getIncidentUnits(id);
        for (const assignment of assignedUnits) {
          await storage.updateUnit(assignment.unitId, { 
            status: "available", 
            assignedIncidentId: null 
          });
        }
      }
      
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to update incident status" });
    }
  });

  // Assignment endpoints
  app.post("/api/incidents/:incidentId/assign", async (req, res) => {
    try {
      const incidentId = parseInt(req.params.incidentId);
      const { unitId } = req.body;
      
      const assignment = await storage.assignUnitToIncident({
        incidentId,
        unitId,
        status: "assigned"
      });
      
      // Update unit status to dispatched
      await storage.updateUnit(unitId, { status: "dispatched", assignedIncidentId: incidentId });
      
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign unit" });
    }
  });

  app.get("/api/incidents/:id/units", async (req, res) => {
    try {
      const incidentId = parseInt(req.params.id);
      const assignments = await storage.getIncidentUnits(incidentId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incident units" });
    }
  });

  // Animal endpoints
  app.get("/api/animals", async (req, res) => {
    try {
      const animals = await storage.getAllAnimals();
      res.json(animals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch animals" });
    }
  });

  app.get("/api/animals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const animal = await storage.getAnimal(id);
      if (!animal) {
        return res.status(404).json({ error: "Animal not found" });
      }
      res.json(animal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch animal" });
    }
  });

  app.post("/api/animals", async (req, res) => {
    try {
      const validatedData = insertAnimalSchema.parse(req.body);
      const animal = await storage.createAnimal(validatedData);
      res.json(animal);
    } catch (error) {
      res.status(400).json({ error: "Invalid animal data" });
    }
  });

  app.put("/api/animals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const animal = await storage.updateAnimal(id, req.body);
      if (!animal) {
        return res.status(404).json({ error: "Animal not found" });
      }
      res.json(animal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update animal" });
    }
  });

  app.get("/api/animals/owner/:ownerName", async (req, res) => {
    try {
      const ownerName = req.params.ownerName;
      const animals = await storage.getAnimalsByOwner(ownerName);
      res.json(animals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch animals by owner" });
    }
  });

  // Enforcement Report endpoints
  app.get("/api/enforcement-reports", async (req, res) => {
    try {
      const reports = await storage.getAllEnforcementReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enforcement reports" });
    }
  });

  app.get("/api/enforcement-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getEnforcementReport(id);
      if (!report) {
        return res.status(404).json({ error: "Enforcement report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enforcement report" });
    }
  });

  app.post("/api/enforcement-reports", async (req, res) => {
    try {
      console.log("Received enforcement report data:", req.body);
      const validatedData = insertEnforcementReportSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const report = await storage.createEnforcementReport(validatedData);
      res.json(report);
    } catch (error) {
      console.error("Enforcement report validation error:", error);
      res.status(400).json({ error: "Invalid enforcement report data", details: error.message });
    }
  });

  app.put("/api/enforcement-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.updateEnforcementReport(id, req.body);
      if (!report) {
        return res.status(404).json({ error: "Enforcement report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to update enforcement report" });
    }
  });

  // Customer endpoints
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const customers = await storage.searchCustomers(query);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to search customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Customer validation error:", error);
      res.status(400).json({ error: "Invalid customer data", details: error.message });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.updateCustomer(id, req.body);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  // Document endpoints
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error) {
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.updateDocument(id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Invoice endpoints
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.updateInvoice(id, req.body);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  // Payment endpoints
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/invoice/:invoiceId", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      const payments = await storage.getPaymentsByInvoiceId(invoiceId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments for invoice" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment data" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.updatePayment(id, req.body);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  // POS Transaction endpoints
  app.get("/api/pos-transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllPosTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch POS transactions" });
    }
  });

  app.get("/api/pos-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getPosTransaction(id);
      if (!transaction) {
        return res.status(404).json({ error: "POS transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch POS transaction" });
    }
  });

  app.post("/api/pos-transactions", async (req, res) => {
    try {
      const validatedData = insertPosTransactionSchema.parse(req.body);
      const transaction = await storage.createPosTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid POS transaction data" });
    }
  });

  app.put("/api/pos-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.updatePosTransaction(id, req.body);
      if (!transaction) {
        return res.status(404).json({ error: "POS transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update POS transaction" });
    }
  });

  // PayPal endpoints
  // BeaverRisk endpoints
  // Risk Location endpoints
  app.get("/api/risk-locations", async (req, res) => {
    try {
      const locations = await storage.getAllRiskLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk locations" });
    }
  });

  app.get("/api/risk-locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getRiskLocation(id);
      if (!location) {
        return res.status(404).json({ error: "Risk location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk location" });
    }
  });

  app.post("/api/risk-locations", async (req, res) => {
    try {
      const validatedData = insertRiskLocationSchema.parse(req.body);
      const location = await storage.createRiskLocation(validatedData);
      res.json(location);
    } catch (error) {
      res.status(400).json({ error: "Invalid risk location data" });
    }
  });

  app.put("/api/risk-locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRiskLocationSchema.parse(req.body);
      const location = await storage.updateRiskLocation(id, validatedData);
      if (!location) {
        return res.status(404).json({ error: "Risk location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(400).json({ error: "Invalid risk location data" });
    }
  });

  // Risk Assessment endpoints
  app.get("/api/risk-assessments", async (req, res) => {
    try {
      const assessments = await storage.getAllRiskAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk assessments" });
    }
  });

  app.get("/api/risk-assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getRiskAssessment(id);
      if (!assessment) {
        return res.status(404).json({ error: "Risk assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk assessment" });
    }
  });

  app.post("/api/risk-assessments", async (req, res) => {
    try {
      const validatedData = insertRiskAssessmentSchema.parse(req.body);
      const assessment = await storage.createRiskAssessment(validatedData);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid risk assessment data" });
    }
  });

  app.put("/api/risk-assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRiskAssessmentSchema.parse(req.body);
      const assessment = await storage.updateRiskAssessment(id, validatedData);
      if (!assessment) {
        return res.status(404).json({ error: "Risk assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid risk assessment data" });
    }
  });

  // Mitigation Plan endpoints
  app.get("/api/mitigation-plans", async (req, res) => {
    try {
      const plans = await storage.getAllMitigationPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mitigation plans" });
    }
  });

  app.get("/api/mitigation-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getMitigationPlan(id);
      if (!plan) {
        return res.status(404).json({ error: "Mitigation plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mitigation plan" });
    }
  });

  app.get("/api/mitigation-plans/risk/:riskId", async (req, res) => {
    try {
      const riskId = parseInt(req.params.riskId);
      const plans = await storage.getMitigationPlansByRiskAssessment(riskId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mitigation plans" });
    }
  });

  app.post("/api/mitigation-plans", async (req, res) => {
    try {
      const validatedData = insertMitigationPlanSchema.parse(req.body);
      const plan = await storage.createMitigationPlan(validatedData);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: "Invalid mitigation plan data" });
    }
  });

  app.put("/api/mitigation-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMitigationPlanSchema.parse(req.body);
      const plan = await storage.updateMitigationPlan(id, validatedData);
      if (!plan) {
        return res.status(404).json({ error: "Mitigation plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: "Invalid mitigation plan data" });
    }
  });

  // Risk Event endpoints
  app.get("/api/risk-events", async (req, res) => {
    try {
      const events = await storage.getAllRiskEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk events" });
    }
  });

  app.get("/api/risk-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getRiskEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Risk event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk event" });
    }
  });

  app.get("/api/risk-events/assessment/:assessmentId", async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.assessmentId);
      const events = await storage.getRiskEventsByAssessment(assessmentId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk events" });
    }
  });

  app.post("/api/risk-events", async (req, res) => {
    try {
      const validatedData = insertRiskEventSchema.parse(req.body);
      const event = await storage.createRiskEvent(validatedData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid risk event data" });
    }
  });

  app.put("/api/risk-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRiskEventSchema.parse(req.body);
      const event = await storage.updateRiskEvent(id, validatedData);
      if (!event) {
        return res.status(404).json({ error: "Risk event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid risk event data" });
    }
  });

  // BeaverAudit endpoints
  // Audit Schedules
  app.get("/api/audit-schedules", async (req, res) => {
    try {
      const schedules = await storage.getAllAuditSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit schedules" });
    }
  });

  app.get("/api/audit-schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.getAuditSchedule(id);
      if (!schedule) {
        return res.status(404).json({ error: "Audit schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit schedule" });
    }
  });

  app.post("/api/audit-schedules", async (req, res) => {
    try {
      const validatedData = insertAuditScheduleSchema.parse(req.body);
      const schedule = await storage.createAuditSchedule(validatedData);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: "Invalid audit schedule data" });
    }
  });

  app.patch("/api/audit-schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateAuditSchedule(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Audit schedule not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update audit schedule" });
    }
  });

  // Audit Templates
  app.get("/api/audit-templates", async (req, res) => {
    try {
      const templates = await storage.getAllAuditTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit templates" });
    }
  });

  app.post("/api/audit-templates", async (req, res) => {
    try {
      const validatedData = insertAuditTemplateSchema.parse(req.body);
      const template = await storage.createAuditTemplate(validatedData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: "Invalid audit template data" });
    }
  });

  // Audit Reports
  app.get("/api/audit-reports", async (req, res) => {
    try {
      const reports = await storage.getAllAuditReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit reports" });
    }
  });

  app.post("/api/audit-reports", async (req, res) => {
    try {
      const validatedData = insertAuditReportSchema.parse(req.body);
      const report = await storage.createAuditReport(validatedData);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid audit report data" });
    }
  });

  app.patch("/api/audit-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateAuditReport(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Audit report not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update audit report" });
    }
  });

  // Audit Non-Compliances
  app.get("/api/audit-non-compliances", async (req, res) => {
    try {
      const nonCompliances = await storage.getAllAuditNonCompliances();
      res.json(nonCompliances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit non-compliances" });
    }
  });

  app.post("/api/audit-non-compliances", async (req, res) => {
    try {
      const validatedData = insertAuditNonComplianceSchema.parse(req.body);
      const nonCompliance = await storage.createAuditNonCompliance(validatedData);
      res.json(nonCompliance);
    } catch (error) {
      res.status(400).json({ error: "Invalid audit non-compliance data" });
    }
  });

  app.patch("/api/audit-non-compliances/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateAuditNonCompliance(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Audit non-compliance not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update audit non-compliance" });
    }
  });

  // Audit Evidence
  app.get("/api/audit-evidence", async (req, res) => {
    try {
      const evidence = await storage.getAllAuditEvidence();
      res.json(evidence);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit evidence" });
    }
  });

  app.post("/api/audit-evidence", async (req, res) => {
    try {
      const validatedData = insertAuditEvidenceSchema.parse(req.body);
      const evidence = await storage.createAuditEvidence(validatedData);
      res.json(evidence);
    } catch (error) {
      res.status(400).json({ error: "Invalid audit evidence data" });
    }
  });

  // BeaverDMV API Routes
  // Character endpoints
  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      const characters = await storage.searchCharacters(query);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Failed to search characters" });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch character" });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const validatedData = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(validatedData);
      res.json(character);
    } catch (error) {
      res.status(400).json({ error: "Invalid character data" });
    }
  });

  // License endpoints
  app.get("/api/licenses", async (req, res) => {
    try {
      const licenses = await storage.getAllLicenses();
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  app.get("/api/licenses/search", async (req, res) => {
    try {
      const licenseNumber = req.query.licenseNumber as string;
      if (!licenseNumber) {
        return res.status(400).json({ error: "License number required" });
      }
      const license = await storage.getLicenseByNumber(licenseNumber);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      
      // Get associated character
      const character = license.characterId ? await storage.getCharacter(license.characterId) : null;
      
      res.json({
        license,
        character
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to search license" });
    }
  });

  app.get("/api/licenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const license = await storage.getLicense(id);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      res.json(license);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch license" });
    }
  });

  app.post("/api/licenses", async (req, res) => {
    try {
      const validatedData = insertLicenseSchema.parse(req.body);
      const license = await storage.createLicense(validatedData);
      res.json(license);
    } catch (error) {
      res.status(400).json({ error: "Invalid license data" });
    }
  });

  // Vehicle Registration endpoints
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicleRegistrations();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/search", async (req, res) => {
    try {
      const plate = req.query.plate as string;
      const vin = req.query.vin as string;
      
      if (!plate && !vin) {
        return res.status(400).json({ error: "Plate number or VIN required" });
      }

      let vehicle;
      if (plate) {
        vehicle = await storage.getVehicleRegistrationByPlate(plate);
      } else if (vin) {
        vehicle = await storage.getVehicleRegistrationByVin(vin);
      }

      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      // Get associated character
      const character = vehicle.characterId ? await storage.getCharacter(vehicle.characterId) : null;
      
      res.json({
        vehicle,
        character
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to search vehicle" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicleRegistration(id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleRegistrationSchema.parse(req.body);
      const vehicle = await storage.createVehicleRegistration(validatedData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });


  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  const httpServer = createServer(app);

  return httpServer;
}
