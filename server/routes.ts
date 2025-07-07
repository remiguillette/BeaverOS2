import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);

  return httpServer;
}
