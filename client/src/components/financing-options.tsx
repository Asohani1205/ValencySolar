import { useState } from "react";
import { Calculator, TrendingUp, Clock, DollarSign, CreditCard, Building, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { SolarAssessment } from "@shared/schema";

interface FinancingOptionsProps {
  assessment: SolarAssessment;
  locationData: any;
}

export default function FinancingOptions({ assessment, locationData }: FinancingOptionsProps) {
  const [loanAmount, setLoanAmount] = useState(assessment.finalCost || 200000);
  const [loanTenure, setLoanTenure] = useState(7);
  const [interestRate, setInterestRate] = useState(9.5);

  const calculateEMI = () => {
    const principal = loanAmount;
    const rate = interestRate / 100 / 12;
    const tenure = loanTenure * 12;
    const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
    return Math.round(emi);
  };

  const calculateSavingsVsEMI = () => {
    const monthlyEMI = calculateEMI();
    const monthlySavings = (assessment.annualSavings || 0) / 12;
    return {
      emi: monthlyEMI,
      savings: Math.round(monthlySavings),
      netBenefit: Math.round(monthlySavings - monthlyEMI)
    };
  };

  const loanOptions = [
    {
      type: "Solar Loan",
      provider: "HDFC Bank",
      interestRate: "8.5% - 12%",
      tenure: "Up to 15 years",
      features: ["No collateral", "Quick approval", "Flexible EMI"],
      processingFee: "0.5% - 2%"
    },
    {
      type: "Green Loan",
      provider: "SBI",
      interestRate: "9% - 11.5%",
      tenure: "Up to 10 years",
      features: ["Subsidized rates", "Government backed", "Tax benefits"],
      processingFee: "0.5% - 1%"
    },
    {
      type: "Home Improvement",
      provider: "ICICI Bank",
      interestRate: "10.5% - 16%",
      tenure: "Up to 7 years",
      features: ["Instant approval", "Minimal documentation", "Top-up facility"],
      processingFee: "1% - 3%"
    },
    {
      type: "Personal Loan",
      provider: "Axis Bank",
      interestRate: "12% - 18%",
      tenure: "Up to 5 years",
      features: ["No collateral", "Quick disbursal", "Flexible tenure"],
      processingFee: "2% - 3%"
    }
  ];

  const paymentModels = [
    {
      title: "CAPEX Model",
      description: "Own the system outright",
      upfrontCost: "100% (₹" + (assessment.finalCost || 0).toLocaleString() + ")",
      ownership: "Customer owns",
      benefits: ["All subsidies", "Maximum savings", "Asset ownership"],
      bestFor: "Those with available capital"
    },
    {
      title: "Solar Loan",
      description: "Finance through bank loans",
      upfrontCost: "10-20% down payment",
      ownership: "Customer owns",
      benefits: ["Immediate ownership", "Tax benefits", "Predictable EMI"],
      bestFor: "Those wanting ownership with financing"
    },
    {
      title: "Solar Lease",
      description: "Lease the system monthly",
      upfrontCost: "₹0 - ₹25,000",
      ownership: "Vendor owns",
      benefits: ["No maintenance", "Fixed monthly cost", "No upfront"],
      bestFor: "Those wanting immediate benefits without ownership"
    },
    {
      title: "PPA Model",
      description: "Pay per unit of electricity",
      upfrontCost: "₹0",
      ownership: "Vendor owns",
      benefits: ["No investment", "Guaranteed savings", "Performance based"],
      bestFor: "Risk-averse customers"
    }
  ];

  const systemSize = assessment.systemSize || 3;
  const subsidyBreakdown = locationData ? {
    central: {
      amount: Math.min(
        systemSize <= 3 
          ? systemSize * locationData.centralSubsidy.upTo3kW
          : (3 * locationData.centralSubsidy.upTo3kW) + ((systemSize - 3) * locationData.centralSubsidy.above3kW),
        locationData.centralSubsidy.maxAmount
      ),
      description: "Central Government Subsidy"
    },
    state: {
      amount: Math.min(
        (assessment.totalCost || 0) * locationData.stateSubsidy.rate,
        locationData.stateSubsidy.maxAmount
      ),
      description: `${locationData.state} State Subsidy`
    }
  } : null;

  const savingsComparison = calculateSavingsVsEMI();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 text-green-600" />
            Solar Financing Options
          </CardTitle>
          <p className="text-sm text-gray-600">
            Explore various ways to finance your ₹{(assessment.finalCost || 0).toLocaleString()} solar investment
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payment-models" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="payment-models">Payment Models</TabsTrigger>
              <TabsTrigger value="loans">Loan Options</TabsTrigger>
              <TabsTrigger value="calculator">EMI Calculator</TabsTrigger>
              <TabsTrigger value="subsidies">Subsidies</TabsTrigger>
            </TabsList>

            <TabsContent value="payment-models" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {paymentModels.map((model, index) => (
                  <Card key={index} className="border-2 hover:border-orange-300 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{model.title}</CardTitle>
                      <p className="text-sm text-gray-600">{model.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Upfront Cost</div>
                        <div className="font-semibold text-green-600">{model.upfrontCost}</div>
                        <div className="text-xs text-gray-500 mt-1">Ownership: {model.ownership}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Key Benefits</div>
                        <div className="space-y-1">
                          {model.benefits.map((benefit, idx) => (
                            <div key={idx} className="text-xs text-gray-600 flex items-center">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500">Best for: {model.bestFor}</div>
                      </div>
                      <Button className="w-full solar-gradient text-white" size="sm">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="loans" className="space-y-4">
              <div className="grid gap-4">
                {loanOptions.map((loan, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{loan.type}</h4>
                          <p className="text-sm text-gray-600">{loan.provider}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {loan.interestRate}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Tenure</div>
                          <div className="font-medium">{loan.tenure}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Processing Fee</div>
                          <div className="font-medium">{loan.processingFee}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-gray-600 mb-1">Features</div>
                          <div className="flex flex-wrap gap-1">
                            {loan.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-3 w-full" size="sm">
                        <Building className="mr-2" size={14} />
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">EMI Calculator</CardTitle>
                  <p className="text-sm text-gray-600">Calculate your monthly payment and compare with solar savings</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="loan-amount">Loan Amount (₹)</Label>
                      <Input
                        id="loan-amount"
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tenure">Tenure (Years)</Label>
                      <Input
                        id="tenure"
                        type="number"
                        value={loanTenure}
                        onChange={(e) => setLoanTenure(Number(e.target.value))}
                        className="mt-1"
                        min="1"
                        max="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interest">Interest Rate (%)</Label>
                      <Input
                        id="interest"
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="mt-1"
                        min="6"
                        max="20"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">₹{calculateEMI().toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Monthly EMI</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">₹{savingsComparison.savings.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Monthly Savings</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${savingsComparison.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{Math.abs(savingsComparison.netBenefit).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Net {savingsComparison.netBenefit >= 0 ? 'Benefit' : 'Cost'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {savingsComparison.netBenefit >= 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm">
                        Great news! Your solar savings will exceed the EMI by ₹{savingsComparison.netBenefit.toLocaleString()} per month.
                        This means your solar system pays for itself while providing additional savings.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-orange-800 text-sm">
                        Your EMI is higher than monthly savings by ₹{Math.abs(savingsComparison.netBenefit).toLocaleString()}.
                        Consider a longer tenure or larger down payment to reduce EMI.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subsidies" className="space-y-4">
              {subsidyBreakdown && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-blue-600">Central Government Subsidy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        ₹{subsidyBreakdown.central.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        ₹{locationData.centralSubsidy.upTo3kW.toLocaleString()}/kW (up to 3kW) + 
                        ₹{locationData.centralSubsidy.above3kW.toLocaleString()}/kW (above 3kW)
                      </div>
                      <div className="space-y-2">
                        {locationData.centralSubsidy.upTo3kW && (
                          <div className="flex justify-between text-sm">
                            <span>First 3kW:</span>
                            <span>₹{(Math.min(3, assessment.systemSize) * locationData.centralSubsidy.upTo3kW).toLocaleString()}</span>
                          </div>
                        )}
                        {assessment.systemSize > 3 && (
                          <div className="flex justify-between text-sm">
                            <span>Above 3kW:</span>
                            <span>₹{((assessment.systemSize - 3) * locationData.centralSubsidy.above3kW).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-green-600">{locationData.state} State Subsidy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ₹{subsidyBreakdown.state.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {(locationData.stateSubsidy.rate * 100)}% of system cost (max ₹{locationData.stateSubsidy.maxAmount.toLocaleString()})
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">Additional Incentives:</h4>
                        {locationData.stateSubsidy.additionalIncentives.map((incentive: string, idx: number) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                            {incentive}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card className="bg-gradient-to-r from-emerald-50 to-green-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 mb-2">
                      Total Subsidies: ₹{(assessment.subsidy || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      You're eligible for significant government support for your solar installation
                    </div>
                    <Button className="solar-gradient text-white">
                      <Calculator className="mr-2" size={16} />
                      Get Subsidy Application Help
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}