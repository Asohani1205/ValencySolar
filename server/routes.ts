import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getChatResponse, getSolarRecommendation } from "./services/openai";
import { getLocationData } from "./data/location-data";
import { calculateSolarSystem } from "../client/src/lib/solar-calculations";
import { insertSolarAssessmentSchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get location data by pincode
  app.get("/api/location/:pincode", async (req, res) => {
    try {
      const { pincode } = req.params;
      const locationData = getLocationData(pincode);
      res.json(locationData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location data" });
    }
  });

  // Create solar assessment
  app.post("/api/assessments", async (req, res) => {
    try {
      const validatedData = insertSolarAssessmentSchema.parse(req.body);
      const assessment = await storage.createSolarAssessment(validatedData);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assessment data" });
    }
  });

  // Update assessment with calculations
  app.put("/api/assessments/:id/calculate", async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await storage.getSolarAssessment(parseInt(id));
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      const locationData = getLocationData(assessment.pincode);
      const calculations = calculateSolarSystem(assessment, locationData);
      
      const updatedAssessment = await storage.updateSolarAssessment(parseInt(id), calculations);
      
      // Generate AI recommendation
      const recommendation = await getSolarRecommendation({
        ...assessment,
        ...calculations
      });
      
      res.json({ 
        assessment: updatedAssessment, 
        recommendation,
        locationData 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate solar system" });
    }
  });

  // Get assessment by ID
  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await storage.getSolarAssessment(parseInt(id));
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  // Chat with AI assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, assessmentId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Save user message
      await storage.createChatMessage({
        message,
        isUser: true,
        timestamp: new Date().toISOString(),
        assessmentId: assessmentId || null
      });

      // Get AI response
      const aiResponse = await getChatResponse(message);

      // Save AI response
      await storage.createChatMessage({
        message: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
        assessmentId: assessmentId || null
      });

      res.json({ response: aiResponse });
    } catch (error) {
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Get chat messages
  app.get("/api/chat", async (req, res) => {
    try {
      const { assessmentId } = req.query;
      const messages = await storage.getChatMessages(
        assessmentId ? parseInt(assessmentId as string) : undefined
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Get vendors by pincode
  app.get("/api/vendors/:pincode", async (req, res) => {
    try {
      const { pincode } = req.params;
      const vendors = await storage.getVendorsByPincode(pincode);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  // Get reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
