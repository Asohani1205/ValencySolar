export interface LocationData {
  pincode: string;
  city: string;
  state: string;
  solarIrradiance: number; // kWh/m²/day
  electricityTariff: number; // ₹/kWh
  subsidyRate: number; // percentage
  maxSubsidy: number; // ₹
}

export const locationDatabase: Record<string, LocationData> = {
  "560001": {
    pincode: "560001",
    city: "Bangalore",
    state: "Karnataka",
    solarIrradiance: 5.2,
    electricityTariff: 8.5,
    subsidyRate: 0.3,
    maxSubsidy: 78000
  },
  "400001": {
    pincode: "400001",
    city: "Mumbai",
    state: "Maharashtra",
    solarIrradiance: 4.8,
    electricityTariff: 9.2,
    subsidyRate: 0.3,
    maxSubsidy: 78000
  },
  "110001": {
    pincode: "110001",
    city: "Delhi",
    state: "Delhi",
    solarIrradiance: 4.5,
    electricityTariff: 7.8,
    subsidyRate: 0.3,
    maxSubsidy: 78000
  },
  "600001": {
    pincode: "600001",
    city: "Chennai",
    state: "Tamil Nadu",
    solarIrradiance: 5.5,
    electricityTariff: 8.0,
    subsidyRate: 0.3,
    maxSubsidy: 78000
  },
  "700001": {
    pincode: "700001",
    city: "Kolkata",
    state: "West Bengal",
    solarIrradiance: 4.2,
    electricityTariff: 7.5,
    subsidyRate: 0.3,
    maxSubsidy: 78000
  }
};

export function getLocationData(pincode: string): LocationData {
  return locationDatabase[pincode] || {
    pincode,
    city: "Unknown",
    state: "Unknown",
    solarIrradiance: 4.8,
    electricityTariff: 8.0,
    subsidyRate: 0.3,
    maxSubsidy: 78000
  };
}
