import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { 
  users, 
  solarAssessments, 
  chatMessages, 
  vendors, 
  reviews 
} from "../shared/schema";

// Database setup script
async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  try {
    console.log("Setting up database...");
    
    // Create database connection
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Run migrations
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully");

    // Seed initial data
    console.log("Seeding initial data...");
    
    // Seed vendors
    const sampleVendors = [
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

    for (const vendor of sampleVendors) {
      await db.insert(vendors).values(vendor);
    }

    console.log("Database setup completed successfully!");
    console.log("✅ Migrations and seeding completed");
    console.log("🚀 Your solar calculator is ready to use with PostgreSQL");
    
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase }; 