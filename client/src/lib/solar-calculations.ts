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
}

export function calculateSolarSystem(
  assessment: SolarAssessment, 
  locationData: PMSuryaGharSubsidy
): SolarCalculationResult {
  const monthlyConsumption = assessment.energyConsumption;
  const dailyConsumption = monthlyConsumption / 30;
  
  // Base system size calculation (with 30% buffer)
  let systemSizeKw = Math.ceil(dailyConsumption * 1.3 / locationData.solarIrradiance);
  
  // Adjust based on roof space (assuming 100 sq ft per kW)
  const roofArea = assessment.roofSpace;
  const maxSystemFromRoof = Math.floor(roofArea / 100);
  systemSizeKw = Math.min(systemSizeKw, maxSystemFromRoof);
  
  // Adjust for shading (reduce by 10-20% if significant shading)
  const shadingFactor = assessment.shading.toLowerCase().includes('significant') || 
                       assessment.shading.toLowerCase().includes('heavy') ? 0.8 : 0.95;
  systemSizeKw = Math.floor(systemSizeKw * shadingFactor);
  
  // Ensure minimum 1kW system
  systemSizeKw = Math.max(1, systemSizeKw);
  
  // Panel quality pricing
  let costPerKw = 50000; // Base cost in ₹
  if (assessment.panelQuality.toLowerCase().includes('premium')) {
    costPerKw = 65000;
  } else if (assessment.panelQuality.toLowerCase().includes('budget')) {
    costPerKw = 40000;
  }
  
  const totalCost = systemSizeKw * costPerKw;
  
  // Calculate Central Government Subsidy
  const centralSubsidy = Math.min(
    systemSizeKw <= 3 
      ? systemSizeKw * locationData.centralSubsidy.upTo3kW
      : (3 * locationData.centralSubsidy.upTo3kW) + ((systemSizeKw - 3) * locationData.centralSubsidy.above3kW),
    locationData.centralSubsidy.maxAmount
  );
  
  // Calculate State Subsidy - handle percentage vs fixed amount
  const stateSubsidyRate = locationData.stateSubsidy.residential.rate;
  const stateSubsidyAmount = stateSubsidyRate > 1 
    ? stateSubsidyRate // Fixed amount in rupees
    : totalCost * (stateSubsidyRate / 100); // Percentage
  const stateSubsidy = Math.min(stateSubsidyAmount, locationData.stateSubsidy.residential.maxAmount);
  
  const totalSubsidy = centralSubsidy + stateSubsidy;
  const finalCost = totalCost - totalSubsidy;
  
  // Generation calculations
  const dailyGeneration = systemSizeKw * locationData.solarIrradiance * shadingFactor;
  const monthlyGeneration = dailyGeneration * 30;
  const annualGeneration = monthlyGeneration * 12;
  
  // Savings calculation including net metering
  const savingsPerUnit = locationData.electricityTariff;
  const excessGeneration = Math.max(0, annualGeneration - (monthlyConsumption * 12));
  const netMeteringSavings = excessGeneration * locationData.netMetering.feedInTariff;
  const directSavings = Math.min(annualGeneration, monthlyConsumption * 12) * savingsPerUnit;
  const annualSavings = directSavings + netMeteringSavings;
  
  const roiYears = Math.ceil(finalCost / annualSavings);
  
  return {
    systemSize: Math.round(systemSizeKw * 10) / 10,
    totalCost: Math.round(totalCost),
    subsidy: Math.round(totalSubsidy),
    finalCost: Math.round(finalCost),
    annualGeneration: Math.round(annualGeneration),
    annualSavings: Math.round(annualSavings),
    roiYears,
    dailyGeneration: Math.round(dailyGeneration * 10) / 10,
    monthlyGeneration: Math.round(monthlyGeneration)
  };
}
