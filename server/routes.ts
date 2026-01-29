import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";

// Simple mock authentication middleware for development
const mockAuth = (req: any, res: any, next: any) => {
  // Mock user for development
  req.user = {
    claims: {
      sub: "dev-user-123",
      email: "dev@example.com",
      first_name: "Dev",
      last_name: "User"
    }
  };
  req.isAuthenticated = () => true;
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Profile Routes
  app.get(api.profiles.me.path, mockAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    res.json(profile || null);
  });

  app.post(api.profiles.create.path, mockAuth, async (req: any, res) => {
    try {
      const input = api.profiles.create.input.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      const profile = await storage.createProfile(input);
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Patient Routes
  app.get(api.patients.list.path, mockAuth, async (req, res) => {
    const patients = await storage.getPatients();
    res.json(patients);
  });

  app.post(api.patients.create.path, mockAuth, async (req: any, res) => {
    try {
      const input = api.patients.create.input.parse({
        ...req.body,
        facilitatorId: req.user.claims.sub
      });
      const patient = await storage.createPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.patients.get.path, mockAuth, async (req, res) => {
    const patient = await storage.getPatient(Number(req.params.id));
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  // Consultation Routes
  app.get(api.consultations.list.path, mockAuth, async (req: any, res) => {
    const status = req.query.status as string | undefined;
    const consultations = await storage.getConsultations({ status });
    res.json(consultations);
  });

  app.post(api.consultations.create.path, mockAuth, async (req: any, res) => {
    try {
      const input = api.consultations.create.input.parse({
        ...req.body,
        facilitatorId: req.user.claims.sub
      });
      const consultation = await storage.createConsultation(input);
      res.status(201).json(consultation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.consultations.get.path, mockAuth, async (req, res) => {
    const consultation = await storage.getConsultation(Number(req.params.id));
    if (!consultation) return res.status(404).json({ message: "Consultation not found" });
    res.json(consultation);
  });

  app.put(api.consultations.update.path, mockAuth, async (req, res) => {
    try {
      const input = api.consultations.update.input.parse(req.body);
      const consultation = await storage.updateConsultation(Number(req.params.id), input);
      if (!consultation) return res.status(404).json({ message: "Consultation not found" });
      res.json(consultation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Messages Routes
  app.get(api.messages.list.path, mockAuth, async (req, res) => {
    const messages = await storage.getMessages(Number(req.params.id));
    res.json(messages);
  });

  app.post(api.messages.create.path, mockAuth, async (req: any, res) => {
    try {
      const input = api.messages.create.input.parse({
        ...req.body,
        consultationId: Number(req.params.id),
        senderId: req.user.claims.sub
      });
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Eye Analysis API Endpoint
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  });

  app.post("/api/analyze-eye", upload.single("image"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      // Simple eye condition detection based on image analysis
      // In production, you would use TensorFlow.js or a proper ML model
      const analysisResult = await analyzeEyeImage(req.file);
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Eye analysis error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  return httpServer;
}

// Mock eye analysis function - In production, integrate with ML model
async function analyzeEyeImage(file: Express.Multer.File) {
  // Simulated analysis - Replace with actual ML model integration
  const conditions = [
    {
      condition: "Cataract (Early Stage)",
      confidence: 0.82,
      description: "Early signs of lens opacification detected. The lens shows clouding that may affect vision over time.",
      recommendation: "Recommended to consult an ophthalmologist for comprehensive eye examination and monitoring.",
      severity: "mild" as const,
    },
    {
      condition: "Clear Eye",
      confidence: 0.95,
      description: "No significant abnormalities detected in this eye image.",
      recommendation: "Continue regular eye check-ups. Maintain eye hygiene and protect eyes from UV exposure.",
      severity: "mild" as const,
    },
    {
      condition: "Conjunctivitis (Mild)",
      confidence: 0.76,
      description: "Some redness and possible inflammation of the conjunctiva detected.",
      recommendation: "Consider using prescribed eye drops and maintain good eye hygiene. Consult a health worker if symptoms persist.",
      severity: "moderate" as const,
    },
    {
      condition: "Pterygium",
      confidence: 0.68,
      description: "Tissue growth on the eye surface detected. This is common in sunny regions.",
      recommendation: "Use UV protection. If vision is affected, surgical consultation may be needed.",
      severity: "moderate" as const,
    },
  ];

  // Random selection for demo - Replace with actual analysis
  const randomResult = conditions[Math.floor(Math.random() * conditions.length)];
  
  return randomResult;
}
