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

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSolarAssessment(assessment: InsertSolarAssessment): Promise<SolarAssessment>;
  getSolarAssessment(id: number): Promise<SolarAssessment | undefined>;
  updateSolarAssessment(id: number, assessment: Partial<SolarAssessment>): Promise<SolarAssessment | undefined>;
  
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(assessmentId?: number): Promise<ChatMessage[]>;
  
  getVendorsByPincode(pincode: string): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  
  getReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assessments: Map<number, SolarAssessment>;
  private messages: Map<number, ChatMessage>;
  private vendors: Map<number, Vendor>;
  private reviews: Map<number, Review>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.messages = new Map();
    this.vendors = new Map();
    this.reviews = new Map();
    this.currentId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed vendors
    const sampleVendors: InsertVendor[] = [
      {
        name: "SunPower Solutions",
        description: "Specializes in residential solar • 500+ installations",
        rating: 4.8,
        reviewCount: 124,
        distance: 2.5,
        responseTime: "Responds within 2 hours",
        pincode: "560001"
      },
      {
        name: "Green Energy Co.",
        description: "Premium installations • 10 year warranty",
        rating: 4.9,
        reviewCount: 89,
        distance: 4.1,
        responseTime: "Responds within 1 hour",
        pincode: "560001"
      },
      {
        name: "Solar Tech India",
        description: "Budget-friendly • Government certified",
        rating: 4.7,
        reviewCount: 203,
        distance: 3.2,
        responseTime: "Responds within 3 hours",
        pincode: "560001"
      }
    ];

    sampleVendors.forEach(vendor => this.createVendor(vendor));

    // Seed reviews
    const sampleReviews: InsertReview[] = [
      {
        customerName: "Rajesh M.",
        rating: 5,
        comment: "Excellent service! The calculator was spot-on and the installer was professional. Saving ₹4,000+ monthly!",
        location: "Bangalore",
        timeAgo: "2 days ago"
      },
      {
        customerName: "Priya S.",
        rating: 5,
        comment: "The AI assistant helped me understand everything clearly. Very impressed with the local vendor quality.",
        location: "Mumbai",
        timeAgo: "1 week ago"
      }
    ];

    sampleReviews.forEach(review => this.createReview(review));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSolarAssessment(assessment: InsertSolarAssessment): Promise<SolarAssessment> {
    const id = this.currentId++;
    const newAssessment: SolarAssessment = {
      ...assessment,
      id,
      createdAt: new Date().toISOString()
    };
    this.assessments.set(id, newAssessment);
    return newAssessment;
  }

  async getSolarAssessment(id: number): Promise<SolarAssessment | undefined> {
    return this.assessments.get(id);
  }

  async updateSolarAssessment(id: number, assessment: Partial<SolarAssessment>): Promise<SolarAssessment | undefined> {
    const existing = this.assessments.get(id);
    if (!existing) return undefined;
    
    const updated: SolarAssessment = { ...existing, ...assessment };
    this.assessments.set(id, updated);
    return updated;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const newMessage: ChatMessage = { ...message, id };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getChatMessages(assessmentId?: number): Promise<ChatMessage[]> {
    const allMessages = Array.from(this.messages.values());
    if (assessmentId) {
      return allMessages.filter(msg => msg.assessmentId === assessmentId);
    }
    return allMessages;
  }

  async getVendorsByPincode(pincode: string): Promise<Vendor[]> {
    // For demo purposes, return all vendors regardless of pincode
    return Array.from(this.vendors.values());
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.currentId++;
    const newVendor: Vendor = { ...vendor, id };
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentId++;
    const newReview: Review = { ...review, id };
    this.reviews.set(id, newReview);
    return newReview;
  }
}

export const storage = new MemStorage();
