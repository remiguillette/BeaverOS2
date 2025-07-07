import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema, insertUnitSchema, insertIncidentUnitSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
