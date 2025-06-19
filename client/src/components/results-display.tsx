import { useQuery } from "@tanstack/react-query";
import { Battery, Zap, DollarSign, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SolarAssessment } from "@shared/schema";
import type { LocationData } from "../../../server/data/location-data";

interface ResultsDisplayProps {
  assessment: SolarAssessment;
}

export default function ResultsDisplay({ assessment }: ResultsDisplayProps) {
  const { data: locationData } = useQuery<LocationData>({
    queryKey: [`/api/location/${assessment.pincode}`],
  });

  if (!assessment.systemSize) {
    return null;
  }

  const paybackProgress = Math.min((1 / (assessment.roiYears || 10)) * 100, 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="solar-gradient text-white">
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2" size={24} />
          Your Solar System Recommendation
        </CardTitle>
        <p className="text-amber-100">
          Customized for {locationData?.city || 'your location'} • Pincode: {assessment.pincode}
        </p>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
            <Battery className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="text-2xl font-bold text-blue-600">{assessment.systemSize} kW</div>
            <div className="text-sm text-blue-800">Recommended System</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
            <DollarSign className="mx-auto mb-2 text-green-600" size={24} />
            <div className="text-2xl font-bold text-green-600">₹{assessment.annualSavings?.toLocaleString()}</div>
            <div className="text-sm text-green-800">Annual Savings</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
            <Clock className="mx-auto mb-2 text-purple-600" size={24} />
            <div className="text-2xl font-bold text-purple-600">{assessment.roiYears} Years</div>
            <div className="text-sm text-purple-800">Payback Period</div>
          </div>
        </div>

        {/* Investment Breakdown */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <DollarSign className="mr-2 text-gray-600" size={16} />
            Investment Breakdown
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>System Cost</span>
              <span className="font-medium">₹{assessment.totalCost?.toLocaleString()}</span>
            </div>
            
            {/* Detailed Subsidy Breakdown */}
            {locationData && (
              <>
                <div className="flex justify-between text-blue-600">
                  <span>Central Govt. Subsidy</span>
                  <span className="font-medium">
                    -₹{Math.min(
                      (assessment.systemSize || 0) <= 3 
                        ? (assessment.systemSize || 0) * locationData.centralSubsidy.upTo3kW
                        : (3 * locationData.centralSubsidy.upTo3kW) + (((assessment.systemSize || 0) - 3) * locationData.centralSubsidy.above3kW),
                      locationData.centralSubsidy.maxAmount
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{locationData.state} State Subsidy</span>
                  <span className="font-medium">
                    -₹{Math.min(
                      (assessment.totalCost || 0) * locationData.stateSubsidy.rate,
                      locationData.stateSubsidy.maxAmount
                    ).toLocaleString()}
                  </span>
                </div>
              </>
            )}
            
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Your Investment</span>
              <span>₹{assessment.finalCost?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Location-specific Benefits */}
        {locationData && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              {locationData.city}, {locationData.state} Benefits
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-blue-600">Net Metering Rate</div>
                <div className="text-gray-600">₹{locationData.netMeteringRate}/kWh for excess power</div>
              </div>
              <div>
                <div className="font-medium text-green-600">Solar Irradiance</div>
                <div className="text-gray-600">{locationData.solarIrradiance} kWh/m²/day</div>
              </div>
            </div>
            
            {locationData.stateSubsidy.additionalIncentives.length > 0 && (
              <div className="mt-3">
                <div className="font-medium text-gray-700 mb-2">Additional State Incentives:</div>
                <div className="flex flex-wrap gap-2">
                  {locationData.stateSubsidy.additionalIncentives.map((incentive: string, idx: number) => (
                    <span key={idx} className="bg-white px-2 py-1 rounded text-xs text-gray-600 border">
                      {incentive}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Energy Generation */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Zap className="mr-2 text-yellow-600" size={16} />
            Energy Generation
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{Math.round((assessment.annualGeneration || 0) / 365)} kWh</div>
              <div className="text-gray-600">Daily Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{Math.round((assessment.annualGeneration || 0) / 12)} kWh</div>
              <div className="text-gray-600">Monthly Average</div>
            </div>
          </div>
        </div>

        {/* ROI Progress */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <TrendingUp className="mr-2 text-emerald-600" size={16} />
            Return on Investment
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payback Progress</span>
              <span>{Math.round(paybackProgress)}%</span>
            </div>
            <Progress value={paybackProgress} className="h-2" />
            <p className="text-xs text-gray-600">
              Based on current electricity rates, your system will pay for itself in {assessment.roiYears} years
            </p>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Environmental Impact</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-teal-600">{Math.round((assessment.annualGeneration || 0) * 0.82)} kg</div>
              <div className="text-gray-600">CO₂ Saved Annually</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-teal-600">{Math.round((assessment.annualGeneration || 0) * 0.82 * 25 / 1000)} tons</div>
              <div className="text-gray-600">CO₂ Saved (25 years)</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Next Steps</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center">
              <CheckCircle className="mr-2 text-blue-500" size={12} />
              Connect with verified installers below
            </li>
            <li className="flex items-center">
              <CheckCircle className="mr-2 text-blue-500" size={12} />
              Schedule a site survey
            </li>
            <li className="flex items-center">
              <CheckCircle className="mr-2 text-blue-500" size={12} />
              Apply for government subsidies
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
