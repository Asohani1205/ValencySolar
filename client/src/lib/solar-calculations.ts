import type { SolarAssessment } from "@shared/schema";
import type { PMSuryaGharSubsidy } from "../../../server/data/pm-surya-ghar-subsidies";

export interface SolarCalculationResult {
  systemSize: number;
  totalCost: number;
  subsidy: number;
  finalCost: number;
  annualGeneration: number;
  annualSavings: number;
  roiYears: number;
  dailyGeneration: number;
  monthlyGeneration: number;
  systemEfficiency: number;
  panelEfficiency: number;
  degradationFactor: number;
  lifetimeGeneration: number;
  seasonalBreakdown: {
    summer: number;
    monsoon: number;
    winter: number;
    spring: number;
  };
  savingsBreakdown: {
    directSavings: number;
    netMeteringSavings: number;
    peakSavings: number;
    offPeakSavings: number;
  };
}

// Panel efficiency mapping based on quality
const PANEL_EFFICIENCIES = {
  'budget': 0.15,      // 15% efficiency - basic panels
  'standard': 0.18,    // 18% efficiency - standard panels
  'premium': 0.21      // 21% efficiency - high-efficiency panels
};

// Seasonal factors for different regions
const SEASONAL_FACTORS = {
  'Bangalore': { summer: 1.15, monsoon: 0.75, winter: 0.95, spring: 1.05 },
  'Mumbai': { summer: 1.1, monsoon: 0.7, winter: 0.9, spring: 1.0 },
  'Delhi': { summer: 1.2, monsoon: 0.8, winter: 0.85, spring: 1.1 },
  'Chennai': { summer: 1.1, monsoon: 0.65, winter: 0.9, spring: 1.05 },
  'Kolkata': { summer: 1.05, monsoon: 0.6, winter: 0.9, spring: 1.0 },
  'default': { summer: 1.1, monsoon: 0.75, winter: 0.9, spring: 1.0 }
};

// System loss factors
const SYSTEM_LOSSES = {
  temperatureDerating: 0.85,    // Temperature losses
  dustAccumulation: 0.95,       // Dust and soiling losses
  inverterEfficiency: 0.95,     // Inverter conversion losses
  wiringLosses: 0.98,           // DC/AC wiring losses
  mismatchLosses: 0.97,         // Panel mismatch losses
  shadingLosses: 0.95           // Default shading (will be overridden)
};

// Time-of-use tariff multipliers
const TIME_OF_USE_MULTIPLIERS = {
  peak: 1.5,      // Peak hours (typically 6-10 PM)
  offPeak: 0.7,   // Off-peak hours (typically 11 PM - 6 AM)
  normal: 1.0      // Normal hours (rest of the day)
};

// Generation timing distribution (when solar generates vs when consumed)
const GENERATION_TIMING = {
  peak: 0.05,     // 5% of generation during peak hours
  offPeak: 0.0,   // 0% during off-peak (no sun)
  normal: 0.95    // 95% during normal hours
};

function getShadingFactor(shading: string): number {
  const shadingLevel = shading.toLowerCase();
  if (shadingLevel.includes('significant') || shadingLevel.includes('heavy')) {
    return 0.8; // 20% reduction
  } else if (shadingLevel.includes('moderate') || shadingLevel.includes('some')) {
    return 0.9; // 10% reduction
  } else if (shadingLevel.includes('minimal') || shadingLevel.includes('none')) {
    return 0.95; // 5% reduction
  }
  return 0.95; // Default
}

function getSeasonalFactors(city: string): { summer: number; monsoon: number; winter: number; spring: number } {
  return SEASONAL_FACTORS[city as keyof typeof SEASONAL_FACTORS] || SEASONAL_FACTORS.default;
}

function calculateCentralSubsidy(systemSizeKw: number, locationData: PMSuryaGharSubsidy): number {
  const centralSubsidy = Math.min(
    systemSizeKw <= 3 
      ? systemSizeKw * locationData.centralSubsidy.upTo3kW
      : (3 * locationData.centralSubsidy.upTo3kW) + ((systemSizeKw - 3) * locationData.centralSubsidy.above3kW),
    locationData.centralSubsidy.maxAmount
  );
  return centralSubsidy;
}

function calculateStateSubsidy(totalCost: number, locationData: PMSuryaGharSubsidy): number {
  const stateSubsidyRate = locationData.stateSubsidy.residential.rate;
  const stateSubsidyAmount = stateSubsidyRate > 1 
    ? stateSubsidyRate // Fixed amount in rupees
    : totalCost * (stateSubsidyRate / 100); // Percentage
  return Math.min(stateSubsidyAmount, locationData.stateSubsidy.residential.maxAmount);
}

function calculateSavingsWithTimeOfUse(
  annualGeneration: number,
  annualConsumption: number,
  locationData: PMSuryaGharSubsidy
): { annual: number; directSavings: number; netMeteringSavings: number; peakSavings: number; offPeakSavings: number } {
  
  const baseTariff = locationData.electricityTariff;
  const feedInTariff = locationData.netMetering.feedInTariff;
  
  // Calculate direct savings (self-consumption)
  const selfConsumption = Math.min(annualGeneration, annualConsumption);
  const directSavings = selfConsumption * baseTariff;
  
  // Calculate excess generation for net metering
  const excessGeneration = Math.max(0, annualGeneration - annualConsumption);
  const netMeteringSavings = excessGeneration * feedInTariff;
  
  // Calculate time-of-use savings
  const peakGeneration = annualGeneration * GENERATION_TIMING.peak;
  const normalGeneration = annualGeneration * GENERATION_TIMING.normal;
  
  const peakSavings = peakGeneration * baseTariff * TIME_OF_USE_MULTIPLIERS.peak;
  const normalSavings = normalGeneration * baseTariff * TIME_OF_USE_MULTIPLIERS.normal;
  
  const totalSavings = directSavings + netMeteringSavings + peakSavings + normalSavings;
  
  return {
    annual: totalSavings,
    directSavings,
    netMeteringSavings,
    peakSavings,
    offPeakSavings: 0 // No generation during off-peak
  };
}

function calculateROIWithDegradation(
  finalCost: number, 
  annualSavings: number, 
  systemLifetime: number = 25
): number {
  const annualDegradation = 0.008; // 0.8% per year
  let cumulativeSavings = 0;
  
  for (let year = 1; year <= systemLifetime; year++) {
    const degradationFactor = Math.pow(1 - annualDegradation, year - 1);
    const yearSavings = annualSavings * degradationFactor;
    cumulativeSavings += yearSavings;
    
    if (cumulativeSavings >= finalCost) {
      return year;
    }
  }
  
  return systemLifetime; // If never pays back, return system lifetime
}

function calculateLifetimeGeneration(
  annualGeneration: number, 
  systemLifetime: number = 25
): number {
  const annualDegradation = 0.008;
  let totalGeneration = 0;
  
  for (let year = 1; year <= systemLifetime; year++) {
    const degradationFactor = Math.pow(1 - annualDegradation, year - 1);
    totalGeneration += annualGeneration * degradationFactor;
  }
  
  return totalGeneration;
}

export function calculateSolarSystem(
  assessment: SolarAssessment, 
  locationData: PMSuryaGharSubsidy
): SolarCalculationResult {
  const monthlyConsumption = assessment.energyConsumption;
  const dailyConsumption = monthlyConsumption / 30;
  
  // 1. PANEL EFFICIENCY BASED ON QUALITY
  const panelEfficiency = PANEL_EFFICIENCIES[assessment.panelQuality.toLowerCase() as keyof typeof PANEL_EFFICIENCIES] || 0.18;
  
  // 2. COMPREHENSIVE SYSTEM EFFICIENCY CALCULATION
  const shadingFactor = getShadingFactor(assessment.shading);
  const temperatureFactor = SYSTEM_LOSSES.temperatureDerating;
  const dustFactor = SYSTEM_LOSSES.dustAccumulation;
  const inverterEfficiency = SYSTEM_LOSSES.inverterEfficiency;
  const wiringLosses = SYSTEM_LOSSES.wiringLosses;
  const mismatchLosses = SYSTEM_LOSSES.mismatchLosses;
  
  const totalSystemEfficiency = shadingFactor * temperatureFactor * dustFactor * 
                               inverterEfficiency * wiringLosses * mismatchLosses;
  
  // 3. SYSTEM SIZING WITH EFFICIENCY CONSIDERATION
  let systemSizeKw = Math.ceil(dailyConsumption * 1.3 / 
                               (locationData.solarIrradiance * totalSystemEfficiency));
  
  // 4. ROOF SPACE CONSTRAINT WITH PANEL EFFICIENCY
  const roofArea = assessment.roofSpace;
  const spacePerKw = 100 / panelEfficiency; // More space needed for lower efficiency panels
  const maxSystemFromRoof = Math.floor(roofArea / spacePerKw);
  systemSizeKw = Math.min(systemSizeKw, maxSystemFromRoof);
  
  // Ensure minimum 1kW system
  systemSizeKw = Math.max(1, systemSizeKw);
  
  // 5. COST CALCULATION WITH EFFICIENCY CONSIDERATION
  const baseCostPerKw = 50000;
  const efficiencyMultiplier = 1 / panelEfficiency; // Higher efficiency = higher cost
  let costPerKw = baseCostPerKw * efficiencyMultiplier;
  
  if (assessment.panelQuality.toLowerCase().includes('premium')) {
    costPerKw *= 1.3; // 30% premium for high-efficiency panels
  } else if (assessment.panelQuality.toLowerCase().includes('budget')) {
    costPerKw *= 0.8; // 20% discount for budget panels
  }
  
  const totalCost = systemSizeKw * costPerKw;
  
  // 6. SUBSIDY CALCULATIONS
  const centralSubsidy = calculateCentralSubsidy(systemSizeKw, locationData);
  const stateSubsidy = calculateStateSubsidy(totalCost, locationData);
  const totalSubsidy = centralSubsidy + stateSubsidy;
  const finalCost = totalCost - totalSubsidy;
  
  // 7. GENERATION WITH SEASONAL VARIATIONS
  const seasonalFactors = getSeasonalFactors(locationData.city);
  const averageSeasonalFactor = (seasonalFactors.summer + seasonalFactors.monsoon + 
                                seasonalFactors.winter + seasonalFactors.spring) / 4;
  
  const dailyGeneration = systemSizeKw * locationData.solarIrradiance * 
                         totalSystemEfficiency * averageSeasonalFactor;
  const monthlyGeneration = dailyGeneration * 30;
  const annualGeneration = monthlyGeneration * 12;
  
  // 8. SEASONAL BREAKDOWN
  const seasonalBreakdown = {
    summer: annualGeneration * seasonalFactors.summer / 4,
    monsoon: annualGeneration * seasonalFactors.monsoon / 4,
    winter: annualGeneration * seasonalFactors.winter / 4,
    spring: annualGeneration * seasonalFactors.spring / 4
  };
  
  // 9. SAVINGS WITH TIME-OF-USE TARIFFS
  const savings = calculateSavingsWithTimeOfUse(
    annualGeneration, 
    monthlyConsumption * 12, 
    locationData
  );
  
  // 10. ROI WITH DEGRADATION
  const roiYears = calculateROIWithDegradation(finalCost, savings.annual);
  
  // 11. LIFETIME GENERATION WITH DEGRADATION
  const lifetimeGeneration = calculateLifetimeGeneration(annualGeneration);
  const degradationFactor = Math.pow(1 - 0.008, 25); // 25-year degradation factor
  
  return {
    systemSize: Math.round(systemSizeKw * 10) / 10,
    totalCost: Math.round(totalCost),
    subsidy: Math.round(totalSubsidy),
    finalCost: Math.round(finalCost),
    annualGeneration: Math.round(annualGeneration),
    annualSavings: Math.round(savings.annual),
    roiYears,
    dailyGeneration: Math.round(dailyGeneration * 10) / 10,
    monthlyGeneration: Math.round(monthlyGeneration),
    systemEfficiency: Math.round(totalSystemEfficiency * 1000) / 10, // Percentage
    panelEfficiency: Math.round(panelEfficiency * 1000) / 10, // Percentage
    degradationFactor: Math.round(degradationFactor * 1000) / 10, // Percentage
    lifetimeGeneration: Math.round(lifetimeGeneration),
    seasonalBreakdown,
    savingsBreakdown: savings
  };
}
