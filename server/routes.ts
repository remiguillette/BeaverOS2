import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema, insertUnitSchema, insertIncidentUnitSchema, insertAnimalSchema, insertEnforcementReportSchema, insertCustomerSchema, insertDocumentSchema, insertInvoiceSchema, insertPaymentSchema, insertPosTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoint
  app.get("/api/auth/me", (req, res) => {
    // User is already authenticated by middleware
    res.json({ user: req.user });
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", authenticated: true });
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

  const httpServer = createServer(app);

  return httpServer;
}
