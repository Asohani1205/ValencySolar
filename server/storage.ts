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
        description: "Specializes in residential solar installations with premium equipment",
        rating: 4.8,
        reviewCount: 124,
        distance: 2.5,
        responseTime: "Responds within 2 hours",
        pincode: "560001",
        specializations: ["Residential Solar", "Grid-tied Systems", "Net Metering"],
        certifications: ["MNRE Approved", "ISO 9001", "NABCB Certified"],
        experienceYears: 8,
        installationsCompleted: 500,
        warrantyYears: 25,
        financingOptions: ["Solar Loans", "EMI Options", "Leasing", "CAPEX Model"],
        priceRange: "₹45,000 - ₹55,000 per kW",
        contactPhone: "+91-9876543210",
        contactEmail: "contact@sunpowersolutions.in",
        website: "www.sunpowersolutions.in",
        servicesOffered: ["Site Survey", "Design", "Installation", "Maintenance", "Subsidy Assistance"]
      },
      {
        name: "Green Energy Co.",
        description: "Premium solar installations with 10-year comprehensive warranty",
        rating: 4.9,
        reviewCount: 89,
        distance: 4.1,
        responseTime: "Responds within 1 hour",
        pincode: "560001",
        specializations: ["Premium Systems", "Commercial Solar", "Energy Storage"],
        certifications: ["MNRE Approved", "IEC Certified", "BIS Standards"],
        experienceYears: 12,
        installationsCompleted: 350,
        warrantyYears: 25,
        financingOptions: ["Bank Partnerships", "Zero Down Payment", "Custom Financing"],
        priceRange: "₹55,000 - ₹70,000 per kW",
        contactPhone: "+91-9876543211",
        contactEmail: "info@greenenergy.co.in",
        website: "www.greenenergy.co.in",
        servicesOffered: ["Premium Design", "Installation", "O&M", "Performance Monitoring", "Insurance"]
      },
      {
        name: "Solar Tech India",
        description: "Budget-friendly solar solutions with government certification",
        rating: 4.7,
        reviewCount: 203,
        distance: 3.2,
        responseTime: "Responds within 3 hours",
        pincode: "560001",
        specializations: ["Budget Systems", "Government Schemes", "Rural Installations"],
        certifications: ["MNRE Approved", "Government Certified", "Quality Assured"],
        experienceYears: 6,
        installationsCompleted: 800,
        warrantyYears: 10,
        financingOptions: ["Government Schemes", "Affordable EMI", "Subsidy Processing"],
        priceRange: "₹35,000 - ₹45,000 per kW",
        contactPhone: "+91-9876543212",
        contactEmail: "support@solartechindia.com",
        website: "www.solartechindia.com",
        servicesOffered: ["Basic Installation", "Government Approvals", "Subsidy Processing", "Basic Maintenance"]
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
      subsidyInfo: assessment.subsidyInfo || null,
      systemSize: assessment.systemSize || null,
      totalCost: assessment.totalCost || null,
      subsidy: assessment.subsidy || null,
      finalCost: assessment.finalCost || null,
      annualGeneration: assessment.annualGeneration || null,
      annualSavings: assessment.annualSavings || null,
      roiYears: assessment.roiYears || null,
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
    const newMessage: ChatMessage = { 
      ...message, 
      id,
      assessmentId: message.assessmentId || null
    };
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
    const newVendor: Vendor = { 
      ...vendor, 
      id,
      website: vendor.website || null
    };
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
