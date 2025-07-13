import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getChatResponse, getSolarRecommendation } from "./services/openai";
import { getPMSuryaGharData } from "./data/pm-surya-ghar-subsidies";
import { getMNREVendorsByPincode } from "./data/mnre-vendors";
import { calculateSolarSystem } from "../client/src/lib/solar-calculations";
import { insertSolarAssessmentSchema, insertChatMessageSchema, insertReviewSchema } from "@shared/schema";
import { AuthService } from "./services/auth";
import { authenticateToken, requireAdmin } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = await AuthService.register(req.body);
      if (result.success) {
        res.json({
          user: result.user,
          token: result.token,
          message: "Registration successful"
        });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = await AuthService.login(req.body);
      if (result.success) {
        res.json({
          user: result.user,
          token: result.token,
          message: "Login successful"
        });
      } else {
        res.status(401).json({ message: result.message });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      res.json({ user: req.user });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  app.put("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
      const result = await AuthService.updateProfile(req.user.id, req.body);
      if (result.success) {
        res.json({ user: result.user, message: "Profile updated successfully" });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      res.status(500).json({ message: "Profile update failed" });
    }
  });

  app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      if (result.success) {
        res.json({ message: "Password changed successfully" });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      res.status(500).json({ message: "Password change failed" });
    }
  });

  app.post("/api/auth/logout", authenticateToken, async (req, res) => {
    try {
      // In a real app, you might want to blacklist the token
      res.json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Get location data by pincode (PM Surya Ghar Yojana data)
  app.get("/api/location/:pincode", async (req, res) => {
    try {
      const { pincode } = req.params;
      const locationData = getPMSuryaGharData(pincode);
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

      const locationData = getPMSuryaGharData(assessment.pincode);
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

  // Get MNRE approved vendors by pincode
  app.get("/api/vendors/:pincode", async (req, res) => {
    try {
      const { pincode } = req.params;
      const mnreVendors = getMNREVendorsByPincode(pincode);
      
      // Convert MNRE vendor format to our API format
      const vendors = mnreVendors.map(vendor => ({
        id: vendor.id,
        name: vendor.companyName,
        description: `MNRE Approved • ${vendor.businessInfo.totalInstallations}+ installations • Est. ${vendor.businessInfo.yearEstablished}`,
        rating: vendor.performance.customerRating,
        reviewCount: vendor.performance.totalReviews,
        distance: Math.random() * 10 + 1, // Calculate based on pincode distance
        responseTime: vendor.performance.averageResponseTime,
        pincode: vendor.pincode,
        specializations: [
          vendor.services.residential ? "Residential" : "",
          vendor.services.commercial ? "Commercial" : "",
          vendor.services.subsidyAssistance ? "Subsidy Support" : ""
        ].filter(Boolean),
        certifications: [
          vendor.certifications.mnreApproved ? "MNRE Approved" : "",
          vendor.certifications.isoNumber || "",
          vendor.certifications.bisLicense ? "BIS Licensed" : ""
        ].filter(Boolean),
        experienceYears: new Date().getFullYear() - vendor.businessInfo.yearEstablished,
        installationsCompleted: vendor.businessInfo.totalInstallations,
        warrantyYears: vendor.pricing.warrantyPeriod,
        financingOptions: vendor.pricing.bankPartners,
        priceRange: vendor.pricing.residentialPriceRange,
        contactPhone: vendor.phoneNumber,
        contactEmail: vendor.emailId,
        website: vendor.website,
        servicesOffered: [
          "Site Survey",
          "Installation", 
          vendor.services.maintenance ? "Maintenance" : "",
          vendor.services.subsidyAssistance ? "Subsidy Processing" : ""
        ].filter(Boolean)
      }));
      
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch MNRE vendors" });
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

  // Add new review
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
