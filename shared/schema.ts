import { pgTable, text, serial, integer, boolean, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  phone: text("phone"),
  address: text("address"),
  pincode: text("pincode"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const solarAssessments = pgTable("solar_assessments", {
  id: serial("id").primaryKey(),
  pincode: text("pincode").notNull(),
  energyConsumption: real("energy_consumption").notNull(),
  roofSpace: real("roof_space").notNull(),
  sunlightExposure: text("sunlight_exposure").notNull(),
  shading: text("shading").notNull(),
  panelQuality: text("panel_quality").notNull(),
  budget: real("budget").notNull(),
  subsidyInfo: text("subsidy_info"),
  systemSize: real("system_size"),
  totalCost: real("total_cost"),
  subsidy: real("subsidy"),
  finalCost: real("final_cost"),
  annualGeneration: real("annual_generation"),
  annualSavings: real("annual_savings"),
  roiYears: real("roi_years"),
  systemEfficiency: real("system_efficiency"),
  panelEfficiency: real("panel_efficiency"),
  degradationFactor: real("degradation_factor"),
  lifetimeGeneration: real("lifetime_generation"),
  seasonalBreakdown: jsonb("seasonal_breakdown"),
  savingsBreakdown: jsonb("savings_breakdown"),
  createdAt: text("created_at").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id"),
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rating: real("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  distance: real("distance").notNull(),
  responseTime: text("response_time").notNull(),
  pincode: text("pincode").notNull(),
  specializations: text("specializations").array().notNull(),
  certifications: text("certifications").array().notNull(),
  experienceYears: integer("experience_years").notNull(),
  installationsCompleted: integer("installations_completed").notNull(),
  warrantyYears: integer("warranty_years").notNull(),
  financingOptions: text("financing_options").array().notNull(),
  priceRange: text("price_range").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  website: text("website"),
  servicesOffered: text("services_offered").array().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  location: text("location").notNull(),
  timeAgo: text("time_ago").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  pincode: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateUserSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  pincode: true,
}).partial();

export const insertSolarAssessmentSchema = createInsertSchema(solarAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type SolarAssessment = typeof solarAssessments.$inferSelect;
export type InsertSolarAssessment = z.infer<typeof insertSolarAssessmentSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
