import { db } from "./db";
import {
  profiles, patients, consultations, messages,
  type Profile, type InsertProfile,
  type Patient, type InsertPatient,
  type Consultation, type InsertConsultation,
  type Message, type InsertMessage
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;

  // Patients
  getPatients(facilitatorId?: string): Promise<Patient[]>; // Optional filter by facilitator
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;

  // Consultations
  getConsultations(filter?: { status?: string; doctorId?: string; facilitatorId?: string }): Promise<Consultation[]>;
  getConsultation(id: number): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: number, updates: Partial<InsertConsultation>): Promise<Consultation | undefined>;

  // Messages
  getMessages(consultationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async getPatients(facilitatorId?: string): Promise<Patient[]> {
    // For now return all, or filter if needed. Facilitators might want to see all patients in their region?
    // Let's return all for MVP.
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async getConsultations(filter?: { status?: string; doctorId?: string; facilitatorId?: string }): Promise<Consultation[]> {
    const conditions = [];
    if (filter?.status) conditions.push(eq(consultations.status, filter.status));
    if (filter?.doctorId) conditions.push(eq(consultations.doctorId, filter.doctorId));
    if (filter?.facilitatorId) conditions.push(eq(consultations.facilitatorId, filter.facilitatorId));

    if (conditions.length > 0) {
      return await db.select().from(consultations).where(and(...conditions)).orderBy(desc(consultations.createdAt));
    }
    return await db.select().from(consultations).orderBy(desc(consultations.createdAt));
  }

  async getConsultation(id: number): Promise<Consultation | undefined> {
    const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
    return consultation;
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [newConsultation] = await db.insert(consultations).values(consultation).returning();
    return newConsultation;
  }

  async updateConsultation(id: number, updates: Partial<InsertConsultation>): Promise<Consultation | undefined> {
    const [updated] = await db.update(consultations).set(updates).where(eq(consultations.id, id)).returning();
    return updated;
  }

  async getMessages(consultationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.consultationId, consultationId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
