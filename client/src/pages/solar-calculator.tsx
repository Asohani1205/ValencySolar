import { useState } from "react";
import { Sun, Calculator, Users, Award } from "lucide-react";
import SolarForm from "@/components/solar-form";
import AiChat from "@/components/ai-chat";
import ResultsDisplay from "@/components/results-display";
import VendorSection from "@/components/vendor-section";
import TrustIndicators from "@/components/trust-indicators";
import type { SolarAssessment } from "@shared/schema";

export default function SolarCalculator() {
  const [currentAssessment, setCurrentAssessment] = useState<SolarAssessment | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showVendors, setShowVendors] = useState(false);

  const handleAssessmentComplete = (assessment: SolarAssessment) => {
    setCurrentAssessment(assessment);
    setShowResults(true);
    setShowVendors(true);
  };

  const handleReset = () => {
    setCurrentAssessment(null);
    setShowResults(false);
    setShowVendors(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="solar-gradient text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                <Sun className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Valency Solar Assistant</h1>
                <p className="text-amber-100 text-sm">Smart Solar Calculator & AI Guide</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-semibold">10,000+</div>
                <div className="text-xs text-amber-100">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">500+</div>
                <div className="text-xs text-amber-100">Verified Vendors</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Calculator */}
          <div className="lg:col-span-2 space-y-6">
            <SolarForm 
              onComplete={handleAssessmentComplete}
              onReset={handleReset}
            />
            
            {showResults && currentAssessment && (
              <ResultsDisplay assessment={currentAssessment} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AiChat assessmentId={currentAssessment?.id} />
            <TrustIndicators />
          </div>
        </div>

        {/* Vendor Section */}
        {showVendors && currentAssessment && (
          <VendorSection pincode={currentAssessment.pincode} />
        )}
      </main>

      {/* Floating Chat Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
          <Calculator className="text-xl" />
        </button>
      </div>
    </div>
  );
}
