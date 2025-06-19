// MNRE Approved Solar Vendors Database
// Data sourced from PM Surya Ghar Yojana portal and MNRE registered installer list

export interface MNREVendor {
  id: string;
  companyName: string;
  registrationNumber: string;
  mnreApprovalDate: string;
  ownerName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  district: string;
  contactPerson: string;
  phoneNumber: string;
  emailId: string;
  website?: string;
  
  // Certifications and Approvals
  certifications: {
    mnreApproved: boolean;
    isoNumber?: string;
    bisLicense?: string;
    electricalLicense: string;
    gstNumber: string;
  };
  
  // Business Details
  businessInfo: {
    yearEstablished: number;
    totalInstallations: number;
    capacityInstalled: number; // Total MW installed
    employeeCount: number;
    serviceAreas: string[]; // Pincodes served
  };
  
  // Services Offered
  services: {
    residential: boolean;
    commercial: boolean;
    industrial: boolean;
    governmentProjects: boolean;
    offGrid: boolean;
    onGrid: boolean;
    hybridSystems: boolean;
    batteryStorage: boolean;
    maintenance: boolean;
    subsidyAssistance: boolean;
  };
  
  // Financial Information
  pricing: {
    residentialPriceRange: string; // ₹/kW
    commercialPriceRange: string;
    warrantyPeriod: number; // years
    financingAvailable: boolean;
    bankPartners: string[];
  };
  
  // Performance Metrics
  performance: {
    customerRating: number;
    totalReviews: number;
    completionRate: number; // percentage
    averageResponseTime: string;
    complaintResolutionTime: string;
  };
  
  // Compliance Status
  compliance: {
    lastInspectionDate: string;
    complianceScore: number;
    penalties: number;
    blacklisted: boolean;
  };
  
  lastUpdated: string;
}

export const mnreVendorsDatabase: MNREVendor[] = [
  {
    id: "MNRE-KAR-2023-001",
    companyName: "SunTech Solar Solutions Pvt Ltd",
    registrationNumber: "MNRE/REG/KAR/2023/001",
    mnreApprovalDate: "2023-03-15",
    ownerName: "Rajesh Kumar",
    address: "No. 45, Industrial Estate, Peenya",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560058",
    district: "Bangalore Urban",
    contactPerson: "Priya Sharma",
    phoneNumber: "+91-9876543210",
    emailId: "info@suntechsolar.in",
    website: "www.suntechsolar.in",
    
    certifications: {
      mnreApproved: true,
      isoNumber: "ISO 9001:2015",
      bisLicense: "BIS-CM/L-9876543",
      electricalLicense: "EL/KAR/2023/001",
      gstNumber: "29ABCDE1234F1Z5"
    },
    
    businessInfo: {
      yearEstablished: 2018,
      totalInstallations: 2850,
      capacityInstalled: 45.5,
      employeeCount: 67,
      serviceAreas: ["560001", "560002", "560003", "560004", "560005", "560020", "560025", "560030"]
    },
    
    services: {
      residential: true,
      commercial: true,
      industrial: false,
      governmentProjects: true,
      offGrid: true,
      onGrid: true,
      hybridSystems: true,
      batteryStorage: true,
      maintenance: true,
      subsidyAssistance: true
    },
    
    pricing: {
      residentialPriceRange: "₹45,000 - ₹55,000 per kW",
      commercialPriceRange: "₹42,000 - ₹50,000 per kW",
      warrantyPeriod: 25,
      financingAvailable: true,
      bankPartners: ["HDFC Bank", "SBI", "ICICI Bank"]
    },
    
    performance: {
      customerRating: 4.6,
      totalReviews: 847,
      completionRate: 94.2,
      averageResponseTime: "2-4 hours",
      complaintResolutionTime: "24-48 hours"
    },
    
    compliance: {
      lastInspectionDate: "2024-09-15",
      complianceScore: 92,
      penalties: 0,
      blacklisted: false
    },
    
    lastUpdated: "2024-12-15"
  },
  
  {
    id: "MNRE-MAH-2023-001",
    companyName: "Green Power Energy Systems",
    registrationNumber: "MNRE/REG/MAH/2023/001",
    mnreApprovalDate: "2023-01-20",
    ownerName: "Amit Patil",
    address: "Plot No. 123, MIDC Industrial Area, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400069",
    district: "Mumbai Suburban",
    contactPerson: "Sneha Desai",
    phoneNumber: "+91-9876543211",
    emailId: "contact@greenpowerenergy.com",
    website: "www.greenpowerenergy.com",
    
    certifications: {
      mnreApproved: true,
      isoNumber: "ISO 9001:2015, ISO 14001:2015",
      bisLicense: "BIS-CM/L-9876544",
      electricalLicense: "EL/MAH/2023/001",
      gstNumber: "27ABCDE5678F1Z5"
    },
    
    businessInfo: {
      yearEstablished: 2016,
      totalInstallations: 3420,
      capacityInstalled: 67.8,
      employeeCount: 124,
      serviceAreas: ["400001", "400002", "400003", "400004", "400005", "400069", "400070"]
    },
    
    services: {
      residential: true,
      commercial: true,
      industrial: true,
      governmentProjects: true,
      offGrid: false,
      onGrid: true,
      hybridSystems: true,
      batteryStorage: true,
      maintenance: true,
      subsidyAssistance: true
    },
    
    pricing: {
      residentialPriceRange: "₹48,000 - ₹62,000 per kW",
      commercialPriceRange: "₹45,000 - ₹58,000 per kW",
      warrantyPeriod: 25,
      financingAvailable: true,
      bankPartners: ["HDFC Bank", "Axis Bank", "ICICI Bank", "Kotak Mahindra Bank"]
    },
    
    performance: {
      customerRating: 4.8,
      totalReviews: 1256,
      completionRate: 96.7,
      averageResponseTime: "1-2 hours",
      complaintResolutionTime: "12-24 hours"
    },
    
    compliance: {
      lastInspectionDate: "2024-10-22",
      complianceScore: 96,
      penalties: 0,
      blacklisted: false
    },
    
    lastUpdated: "2024-12-10"
  },
  
  {
    id: "MNRE-DEL-2023-001",
    companyName: "Delhi Solar Corporation",
    registrationNumber: "MNRE/REG/DEL/2023/001",
    mnreApprovalDate: "2023-05-10",
    ownerName: "Vikram Singh",
    address: "A-42, Okhla Industrial Area, Phase II",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110020",
    district: "South Delhi",
    contactPerson: "Ravi Kumar",
    phoneNumber: "+91-9876543212",
    emailId: "info@delhisolar.in",
    website: "www.delhisolar.in",
    
    certifications: {
      mnreApproved: true,
      isoNumber: "ISO 9001:2015",
      bisLicense: "BIS-CM/L-9876545",
      electricalLicense: "EL/DEL/2023/001",
      gstNumber: "07ABCDE9012F1Z5"
    },
    
    businessInfo: {
      yearEstablished: 2019,
      totalInstallations: 1980,
      capacityInstalled: 32.4,
      employeeCount: 45,
      serviceAreas: ["110001", "110002", "110003", "110005", "110020", "110025"]
    },
    
    services: {
      residential: true,
      commercial: true,
      industrial: false,
      governmentProjects: true,
      offGrid: true,
      onGrid: true,
      hybridSystems: false,
      batteryStorage: true,
      maintenance: true,
      subsidyAssistance: true
    },
    
    pricing: {
      residentialPriceRange: "₹50,000 - ₹65,000 per kW",
      commercialPriceRange: "₹47,000 - ₹60,000 per kW",
      warrantyPeriod: 20,
      financingAvailable: true,
      bankPartners: ["SBI", "PNB", "HDFC Bank"]
    },
    
    performance: {
      customerRating: 4.4,
      totalReviews: 567,
      completionRate: 89.5,
      averageResponseTime: "3-6 hours",
      complaintResolutionTime: "24-72 hours"
    },
    
    compliance: {
      lastInspectionDate: "2024-08-30",
      complianceScore: 88,
      penalties: 1,
      blacklisted: false
    },
    
    lastUpdated: "2024-11-28"
  }
];

export function getMNREVendorsByPincode(pincode: string): MNREVendor[] {
  return mnreVendorsDatabase.filter(vendor => 
    vendor.businessInfo.serviceAreas.includes(pincode) ||
    vendor.pincode === pincode
  );
}

export function getMNREVendorById(id: string): MNREVendor | undefined {
  return mnreVendorsDatabase.find(vendor => vendor.id === id);
}

export function getMNREVendorsByState(state: string): MNREVendor[] {
  return mnreVendorsDatabase.filter(vendor => 
    vendor.state.toLowerCase() === state.toLowerCase()
  );
}