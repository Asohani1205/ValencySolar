import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { 
  users, 
  solarAssessments, 
  chatMessages, 
  vendors, 
  reviews,
  type User, 
  type InsertUser,
  type SolarAssessment,
  type InsertSolarAssessment,
  type ChatMessage,
  type InsertChatMessage,
  type Vendor,
  type InsertVendor,
  type Review,
  type InsertReview
} from "@shared/schema";

// Database connection - only create if DATABASE_URL is provided
let sql: any = null;
let db: any = null;

if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "your_database_url_here") {
  try {
    sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql);
  } catch (error) {
    console.warn("Database connection failed, using fallback:", error);
  }
}

// Database storage implementation
export class DatabaseStorage {
  constructor() {
    if (!db) {
      throw new Error("Database not available");
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(users).values({
      ...user,
      role: 'user',
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async createSolarAssessment(assessment: InsertSolarAssessment): Promise<SolarAssessment> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(solarAssessments).values({
      ...assessment,
      createdAt: new Date().toISOString()
    }).returning();
    return result[0];
  }

  async getSolarAssessment(id: number): Promise<SolarAssessment | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(solarAssessments).where(eq(solarAssessments.id, id)).limit(1);
    return result[0];
  }

  async updateSolarAssessment(id: number, assessment: Partial<SolarAssessment>): Promise<SolarAssessment | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(solarAssessments)
      .set(assessment)
      .where(eq(solarAssessments.id, id))
      .returning();
    return result[0];
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(chatMessages).values({
      ...message,
      timestamp: new Date().toISOString()
    }).returning();
    return result[0];
  }

  async getChatMessages(assessmentId?: number): Promise<ChatMessage[]> {
    if (!db) throw new Error("Database not available");
    if (assessmentId) {
      return await db.select().from(chatMessages).where(eq(chatMessages.assessmentId, assessmentId));
    }
    return await db.select().from(chatMessages);
  }

  async getVendorsByPincode(pincode: string): Promise<Vendor[]> {
    if (!db) throw new Error("Database not available");
    return await db.select().from(vendors).where(eq(vendors.pincode, pincode));
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(vendors).values(vendor).returning();
    return result[0];
  }

  async getReviews(): Promise<Review[]> {
    if (!db) throw new Error("Database not available");
    return await db.select().from(reviews);
  }

  async createReview(review: InsertReview): Promise<Review> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }
}

// Import eq for where clauses
import { eq } from 'drizzle-orm'; 