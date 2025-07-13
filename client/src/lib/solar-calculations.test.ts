import { calculateSolarSystem } from './solar-calculations';
import type { SolarAssessment } from '@shared/schema';
import type { PMSuryaGharSubsidy } from '../../../server/data/pm-surya-ghar-subsidies';

// Test data
const mockLocationData: PMSuryaGharSubsidy = {
  pincode: "560001",
  city: "Bangalore",
  state: "Karnataka",
  district: "Bangalore Urban",
  discom: "BESCOM",
  solarIrradiance: 5.2,
  electricityTariff: 8.5,
  centralSubsidy: {
    upTo3kW: 14588,
    above3kW: 7294,
    maxAmount: 78000,
    applicableCategories: ["Residential", "Group Housing"]
  },
  stateSubsidy: {
    residential: {
      rate: 0.20,
      maxAmount: 50000,
      eligibilityCriteria: ["BPL families", "SC/ST categories", "Women applicants"]
    },
    additionalIncentives: [
      "Net metering facility",
      "Accelerated depreciation for commercial",
      "Property tax exemption for 5 years"
    ]
  },
  netMetering: {
    feedInTariff: 7.5,
    maxCapacity: 10,
    settlementPeriod: "Annual",
    bankingAllowed: true
  },
  localIncentives: {
    municipalRebates: ["BBMP solar rebate", "Green building certification"],
    propertyTaxExemption: true,
    acceleratedDepreciation: true,
    gstBenefits: ["5% GST on solar panels", "Input tax credit available"]
  },
  approvedVendors: 87,
  lastUpdated: "2024-12-15"
};

const mockAssessment: SolarAssessment = {
  id: 1,
  pincode: "560001",
  energyConsumption: 600, // 600 kWh/month
  roofSpace: 500, // 500 sq ft
  sunlightExposure: "excellent",
  shading: "minimal",
  panelQuality: "premium",
  budget: 300000,
  subsidyInfo: null,
  systemSize: null,
  totalCost: null,
  subsidy: null,
  finalCost: null,
  annualGeneration: null,
  annualSavings: null,
  roiYears: null,
  systemEfficiency: null,
  panelEfficiency: null,
  degradationFactor: null,
  lifetimeGeneration: null,
  seasonalBreakdown: null,
  savingsBreakdown: null,
  createdAt: new Date().toISOString()
};

describe('Enhanced Solar Calculations', () => {
  test('should calculate system size correctly with panel efficiency', () => {
    const result = calculateSolarSystem(mockAssessment, mockLocationData);
    
    // Premium panels (21% efficiency) should require less space
    expect(result.systemSize).toBeGreaterThan(0);
    expect(result.panelEfficiency).toBe(21); // 21% for premium panels
  });

  test('should calculate comprehensive system efficiency', () => {
    const result = calculateSolarSystem(mockAssessment, mockLocationData);
    
    // System efficiency should be less than 100% due to various losses
    expect(result.systemEfficiency).toBeLessThan(100);
    expect(result.systemEfficiency).toBeGreaterThan(50); // Should be reasonable
  });

  test('should calculate seasonal breakdown', () => {
    const result = calculateSolarSystem(mockAssessment, mockLocationData);
    
    expect(result.seasonalBreakdown).toBeDefined();
    expect(result.seasonalBreakdown.summer).toBeGreaterThan(0);
    expect(result.seasonalBreakdown.monsoon).toBeGreaterThan(0);
    expect(result.seasonalBreakdown.winter).toBeGreaterThan(0);
    expect(result.seasonalBreakdown.spring).toBeGreaterThan(0);
    
    // Summer should be highest for Bangalore
    expect(result.seasonalBreakdown.summer).toBeGreaterThan(result.seasonalBreakdown.monsoon);
  });

  test('should calculate detailed savings breakdown', () => {
    const result = calculateSolarSystem(mockAssessment, mockLocationData);
    
    expect(result.savingsBreakdown).toBeDefined();
    expect(result.savingsBreakdown.directSavings).toBeGreaterThan(0);
    expect(result.savingsBreakdown.netMeteringSavings).toBeGreaterThanOrEqual(0);
    expect(result.savingsBreakdown.peakSavings).toBeGreaterThanOrEqual(0);
    expect(result.savingsBreakdown.offPeakSavings).toBe(0); // No generation during off-peak
  });

  test('should calculate degradation over 25 years', () => {
    const result = calculateSolarSystem(mockAssessment, mockLocationData);
    
    expect(result.degradationFactor).toBeLessThan(100); // Should be degraded
    expect(result.degradationFactor).toBeGreaterThan(70); // Should still be significant
    expect(result.lifetimeGeneration).toBeGreaterThan(result.annualGeneration * 20); // Should be substantial
  });

  test('should calculate ROI with degradation', () => {
    const result = calculateSolarSystem(mockAssessment, mockLocationData);
    
    expect(result.roiYears).toBeGreaterThan(0);
    expect(result.roiYears).toBeLessThanOrEqual(25); // Should not exceed system lifetime
  });

  test('should handle different panel qualities correctly', () => {
    const budgetAssessment = { ...mockAssessment, panelQuality: 'budget' };
    const standardAssessment = { ...mockAssessment, panelQuality: 'standard' };
    const premiumAssessment = { ...mockAssessment, panelQuality: 'premium' };
    
    const budgetResult = calculateSolarSystem(budgetAssessment, mockLocationData);
    const standardResult = calculateSolarSystem(standardAssessment, mockLocationData);
    const premiumResult = calculateSolarSystem(premiumAssessment, mockLocationData);
    
    // Premium should have highest efficiency
    expect(premiumResult.panelEfficiency).toBeGreaterThan(standardResult.panelEfficiency);
    expect(standardResult.panelEfficiency).toBeGreaterThan(budgetResult.panelEfficiency);
    
    // Premium should cost more per kW
    expect(premiumResult.totalCost / premiumResult.systemSize).toBeGreaterThan(
      budgetResult.totalCost / budgetResult.systemSize
    );
  });

  test('should handle shading factors correctly', () => {
    const heavyShadingAssessment = { ...mockAssessment, shading: 'significant' };
    const minimalShadingAssessment = { ...mockAssessment, shading: 'minimal' };
    
    const heavyShadingResult = calculateSolarSystem(heavyShadingAssessment, mockLocationData);
    const minimalShadingResult = calculateSolarSystem(minimalShadingAssessment, mockLocationData);
    
    // Heavy shading should result in lower generation
    expect(heavyShadingResult.annualGeneration).toBeLessThan(minimalShadingResult.annualGeneration);
  });

  test('should calculate subsidies correctly', () => {
    const result = calculateSolarSystem(mockAssessment, mockLocationData);
    
    // Central subsidy should be calculated correctly
    const expectedCentralSubsidy = Math.min(
      result.systemSize <= 3 
        ? result.systemSize * mockLocationData.centralSubsidy.upTo3kW
        : (3 * mockLocationData.centralSubsidy.upTo3kW) + ((result.systemSize - 3) * mockLocationData.centralSubsidy.above3kW),
      mockLocationData.centralSubsidy.maxAmount
    );
    
    expect(result.subsidy).toBeGreaterThanOrEqual(expectedCentralSubsidy);
    expect(result.finalCost).toBe(result.totalCost - result.subsidy);
  });

  test('should validate roof space constraints', () => {
    const smallRoofAssessment = { ...mockAssessment, roofSpace: 100 }; // Very small roof
    const largeRoofAssessment = { ...mockAssessment, roofSpace: 1000 }; // Large roof
    
    const smallRoofResult = calculateSolarSystem(smallRoofAssessment, mockLocationData);
    const largeRoofResult = calculateSolarSystem(largeRoofAssessment, mockLocationData);
    
    // Small roof should limit system size
    expect(smallRoofResult.systemSize).toBeLessThanOrEqual(1); // Should be very limited
    
    // Large roof should allow larger system
    expect(largeRoofResult.systemSize).toBeGreaterThan(smallRoofResult.systemSize);
  });
});

// Performance test
describe('Performance Tests', () => {
  test('should complete calculations within reasonable time', () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      calculateSolarSystem(mockAssessment, mockLocationData);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete 1000 calculations in less than 1 second
    expect(duration).toBeLessThan(1000);
  });
});

// Edge cases
describe('Edge Cases', () => {
  test('should handle minimum consumption', () => {
    const minAssessment = { ...mockAssessment, energyConsumption: 50 };
    const result = calculateSolarSystem(minAssessment, mockLocationData);
    
    expect(result.systemSize).toBeGreaterThanOrEqual(1); // Minimum 1kW
  });

  test('should handle maximum consumption', () => {
    const maxAssessment = { ...mockAssessment, energyConsumption: 2000 };
    const result = calculateSolarSystem(maxAssessment, mockLocationData);
    
    expect(result.systemSize).toBeGreaterThan(5); // Should be substantial
  });

  test('should handle zero roof space gracefully', () => {
    const noRoofAssessment = { ...mockAssessment, roofSpace: 0 };
    const result = calculateSolarSystem(noRoofAssessment, mockLocationData);
    
    expect(result.systemSize).toBe(1); // Should default to minimum
  });
}); 