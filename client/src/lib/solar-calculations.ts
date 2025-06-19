import type { SolarAssessment } from "@shared/schema";
import type { LocationData } from "../../../server/data/location-data";

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
  locationData: LocationData
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
  let costPerKw = 50000; // Base cost
  if (assessment.panelQuality.toLowerCase().includes('premium')) {
    costPerKw = 65000;
  } else if (assessment.panelQuality.toLowerCase().includes('budget')) {
    costPerKw = 40000;
  }
  
  const totalCost = systemSizeKw * costPerKw;
  const subsidy = Math.min(locationData.maxSubsidy, totalCost * locationData.subsidyRate);
  const finalCost = totalCost - subsidy;
  
  // Generation calculations
  const dailyGeneration = systemSizeKw * locationData.solarIrradiance * shadingFactor;
  const monthlyGeneration = dailyGeneration * 30;
  const annualGeneration = monthlyGeneration * 12;
  
  // Savings calculation
  const savingsPerUnit = locationData.electricityTariff;
  const annualSavings = Math.min(annualGeneration, monthlyConsumption * 12) * savingsPerUnit;
  const roiYears = Math.ceil(finalCost / annualSavings);
  
  return {
    systemSize: Math.round(systemSizeKw * 10) / 10,
    totalCost: Math.round(totalCost),
    subsidy: Math.round(subsidy),
    finalCost: Math.round(finalCost),
    annualGeneration: Math.round(annualGeneration),
    annualSavings: Math.round(annualSavings),
    roiYears,
    dailyGeneration: Math.round(dailyGeneration * 10) / 10,
    monthlyGeneration: Math.round(monthlyGeneration)
  };
}
