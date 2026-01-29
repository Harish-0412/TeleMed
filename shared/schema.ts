import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["doctor", "facilitator", "admin"] }).notNull(),
  specialization: text("specialization"), // For doctors
  location: text("location"), // For facilitators
  isApproved: boolean("is_approved").default(false),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  contactNumber: text("contact_number"),
  medicalHistory: text("medical_history"),
  facilitatorId: varchar("facilitator_id").references(() => users.id), // Created by this facilitator
  createdAt: timestamp("created_at").defaultNow(),
});

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  facilitatorId: varchar("facilitator_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").references(() => users.id),
  status: text("status", { enum: ["pending", "active", "completed"] }).default("pending").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id").notNull().references(() => consultations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  facilitator: one(users, { fields: [patients.facilitatorId], references: [users.id] }),
  consultations: many(consultations),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  patient: one(patients, { fields: [consultations.patientId], references: [patients.id] }),
  facilitator: one(users, { fields: [consultations.facilitatorId], references: [users.id] }),
  doctor: one(users, { fields: [consultations.doctorId], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  consultation: one(consultations, { fields: [messages.consultationId], references: [consultations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

// Schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

// Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
