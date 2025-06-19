export interface LocationData {
  pincode: string;
  city: string;
  state: string;
  solarIrradiance: number; // kWh/m²/day
  electricityTariff: number; // ₹/kWh
  centralSubsidy: {
    rate: number; // percentage
    maxAmount: number; // ₹
    upTo3kW: number; // ₹ per kW
    above3kW: number; // ₹ per kW
  };
  stateSubsidy: {
    rate: number; // percentage
    maxAmount: number; // ₹
    additionalIncentives: string[];
  };
  netMeteringRate: number; // ₹/kWh for excess power
  localIncentives: string[];
}

export const locationDatabase: Record<string, LocationData> = {
  "560001": {
    pincode: "560001",
    city: "Bangalore",
    state: "Karnataka",
    solarIrradiance: 5.2,
    electricityTariff: 8.5,
    centralSubsidy: {
      rate: 0.3,
      maxAmount: 78000,
      upTo3kW: 14588,
      above3kW: 7294
    },
    stateSubsidy: {
      rate: 0.20,
      maxAmount: 50000,
      additionalIncentives: ["Net metering", "Accelerated depreciation", "Property tax exemption"]
    },
    netMeteringRate: 7.5,
    localIncentives: ["BESCOM rebate", "Green building certification"]
  },
  "400001": {
    pincode: "400001",
    city: "Mumbai",
    state: "Maharashtra",
    solarIrradiance: 4.8,
    electricityTariff: 9.2,
    centralSubsidy: {
      rate: 0.3,
      maxAmount: 78000,
      upTo3kW: 14588,
      above3kW: 7294
    },
    stateSubsidy: {
      rate: 0.25,
      maxAmount: 75000,
      additionalIncentives: ["Net metering", "Wheeling charges waiver", "Banking facility"]
    },
    netMeteringRate: 8.5,
    localIncentives: ["MSEDCL incentive", "Mumbai municipal rebate"]
  },
  "110001": {
    pincode: "110001",
    city: "Delhi",
    state: "Delhi",
    solarIrradiance: 4.5,
    electricityTariff: 7.8,
    centralSubsidy: {
      rate: 0.3,
      maxAmount: 78000,
      upTo3kW: 14588,
      above3kW: 7294
    },
    stateSubsidy: {
      rate: 0.30,
      maxAmount: 90000,
      additionalIncentives: ["Net metering", "Generation based incentive", "Interest subsidy on loans"]
    },
    netMeteringRate: 7.0,
    localIncentives: ["Delhi solar policy incentive", "Pollution control benefit"]
  },
  "600001": {
    pincode: "600001",
    city: "Chennai",
    state: "Tamil Nadu",
    solarIrradiance: 5.5,
    electricityTariff: 8.0,
    centralSubsidy: {
      rate: 0.3,
      maxAmount: 78000,
      upTo3kW: 14588,
      above3kW: 7294
    },
    stateSubsidy: {
      rate: 0.20,
      maxAmount: 60000,
      additionalIncentives: ["Net metering", "Renewable energy certificate", "Capital subsidy"]
    },
    netMeteringRate: 7.5,
    localIncentives: ["TANGEDCO subsidy", "Solar park benefits"]
  },
  "700001": {
    pincode: "700001",
    city: "Kolkata",
    state: "West Bengal",
    solarIrradiance: 4.2,
    electricityTariff: 7.5,
    centralSubsidy: {
      rate: 0.3,
      maxAmount: 78000,
      upTo3kW: 14588,
      above3kW: 7294
    },
    stateSubsidy: {
      rate: 0.15,
      maxAmount: 40000,
      additionalIncentives: ["Net metering", "Simplified approval process"]
    },
    netMeteringRate: 6.5,
    localIncentives: ["WBSEDCL incentive", "Industrial promotion policy benefit"]
  }
};

export function getLocationData(pincode: string): LocationData {
  return locationDatabase[pincode] || {
    pincode,
    city: "Unknown",
    state: "Unknown",
    solarIrradiance: 4.8,
    electricityTariff: 8.0,
    centralSubsidy: {
      rate: 0.3,
      maxAmount: 78000,
      upTo3kW: 14588,
      above3kW: 7294
    },
    stateSubsidy: {
      rate: 0.15,
      maxAmount: 30000,
      additionalIncentives: ["Net metering"]
    },
    netMeteringRate: 7.0,
    localIncentives: []
  };
}
