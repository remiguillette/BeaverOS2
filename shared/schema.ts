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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type IncidentUnit = typeof incidentUnits.$inferSelect;
export type InsertIncidentUnit = z.infer<typeof insertIncidentUnitSchema>;
