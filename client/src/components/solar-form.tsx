import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Zap, Home, Sun, Eye, DollarSign, Award, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSolarAssessmentSchema } from "@shared/schema";
import type { SolarAssessment } from "@shared/schema";
import { z } from "zod";

const formSchema = insertSolarAssessmentSchema.extend({
  energyConsumption: z.number().min(50, "Energy consumption must be at least 50 kWh"),
  roofSpace: z.number().min(100, "Roof space must be at least 100 sq ft"),
  budget: z.number().min(50000, "Budget must be at least ₹50,000"),
});

type FormData = z.infer<typeof formSchema>;

interface SolarFormProps {
  onComplete: (assessment: SolarAssessment) => void;
  onReset: () => void;
}

const steps = [
  { id: 'location', title: 'Location', icon: MapPin, description: 'Tell us your location' },
  { id: 'energy', title: 'Energy Usage', icon: Zap, description: 'Your monthly consumption' },
  { id: 'roof', title: 'Roof Space', icon: Home, description: 'Available installation area' },
  { id: 'sunlight', title: 'Sunlight', icon: Sun, description: 'Solar exposure details' },
  { id: 'shading', title: 'Shading', icon: Eye, description: 'Any obstructions' },
  { id: 'panels', title: 'Panel Quality', icon: Award, description: 'Your preferences' },
  { id: 'budget', title: 'Budget', icon: DollarSign, description: 'Investment range' },
];

export default function SolarForm({ onComplete, onReset }: SolarFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pincode: "",
      energyConsumption: 0,
      roofSpace: 0,
      sunlightExposure: "",
      shading: "",
      panelQuality: "",
      budget: 0,
      subsidyInfo: "",
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json();
    },
    onSuccess: (assessment) => {
      calculateMutation.mutate(assessment.id);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (assessmentId: number) => {
      const response = await apiRequest("PUT", `/api/assessments/${assessmentId}/calculate`);
      return response.json();
    },
    onSuccess: (result) => {
      onComplete(result.assessment);
      toast({
        title: "Assessment Complete!",
        description: "Your solar recommendation has been calculated.",
      });
    },
    onError: () => {
      toast({
        title: "Calculation Error",
        description: "Failed to calculate solar system. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createAssessmentMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Solar Assessment Progress</h2>
            <span className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</span>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          <div className="flex justify-between text-xs text-gray-500">
            {steps.map((step, index) => (
              <span key={step.id} className={index <= currentStep ? "text-orange-600 font-medium" : ""}>
                {step.title}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card className="overflow-hidden">
        <CardHeader className="solar-gradient text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <currentStepData.icon className="text-xl" />
            </div>
            <div>
              <CardTitle className="text-xl">{currentStepData.description}</CardTitle>
              <p className="text-amber-100">
                {currentStep === 0 && "We'll provide hyper-localized solar data for your area"}
                {currentStep === 1 && "This helps us size your solar system correctly"}
                {currentStep === 2 && "We need to know available installation space"}
                {currentStep === 3 && "Solar exposure affects system performance"}
                {currentStep === 4 && "Shading impacts energy generation"}
                {currentStep === 5 && "Choose the right panels for your needs"}
                {currentStep === 6 && "Your investment range for the solar system"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 0: Location */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pincode">Enter your 6-digit pincode</Label>
                  <div className="relative">
                    <Input
                      id="pincode"
                      placeholder="e.g., 560001"
                      {...form.register("pincode")}
                      className="text-lg p-4 pr-10"
                    />
                    <MapPin className="absolute right-3 top-4 text-orange-500" size={16} />
                  </div>
                  {form.formState.errors.pincode && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.pincode.message}</p>
                  )}
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Sun className="text-emerald-500 mr-2" size={16} />
                    What we'll analyze for your location:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Sun className="text-yellow-500 mr-2" size={14} />
                      Solar irradiance levels
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="text-green-500 mr-2" size={14} />
                      Local electricity tariffs
                    </div>
                    <div className="flex items-center">
                      <Award className="text-blue-500 mr-2" size={14} />
                      Government subsidies
                    </div>
                    <div className="flex items-center">
                      <MapPin className="text-purple-500 mr-2" size={14} />
                      Verified installers nearby
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Energy Consumption */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="energyConsumption">Monthly electricity consumption (kWh)</Label>
                  <Input
                    id="energyConsumption"
                    type="number"
                    placeholder="e.g., 300"
                    {...form.register("energyConsumption", { valueAsNumber: true })}
                    className="text-lg p-4"
                  />
                  {form.formState.errors.energyConsumption && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.energyConsumption.message}</p>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  You can find this on your electricity bill under 'Units Consumed' or 'kWh Used'
                </p>
              </div>
            )}

            {/* Step 2: Roof Space */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roofSpace">Available roof space (sq ft)</Label>
                  <Input
                    id="roofSpace"
                    type="number"
                    placeholder="e.g., 800"
                    {...form.register("roofSpace", { valueAsNumber: true })}
                    className="text-lg p-4"
                  />
                  {form.formState.errors.roofSpace && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.roofSpace.message}</p>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Consider obstructions like water tanks, AC units, or chimneys
                </p>
              </div>
            )}

            {/* Step 3: Sunlight Exposure */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sunlightExposure">Sunlight exposure details</Label>
                  <Select onValueChange={(value) => form.setValue("sunlightExposure", value)}>
                    <SelectTrigger className="text-lg p-4">
                      <SelectValue placeholder="Select sunlight exposure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent-8-plus">Excellent (8+ hours direct sunlight)</SelectItem>
                      <SelectItem value="good-6-8">Good (6-8 hours direct sunlight)</SelectItem>
                      <SelectItem value="average-4-6">Average (4-6 hours direct sunlight)</SelectItem>
                      <SelectItem value="poor-less-4">Poor (Less than 4 hours direct sunlight)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.sunlightExposure && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.sunlightExposure.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Shading */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shading">Shading conditions</Label>
                  <Textarea
                    id="shading"
                    placeholder="Describe any shading from trees, buildings, or other structures..."
                    {...form.register("shading")}
                    className="min-h-[100px]"
                  />
                  {form.formState.errors.shading && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.shading.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Panel Quality */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="panelQuality">Panel quality preference</Label>
                  <Select onValueChange={(value) => form.setValue("panelQuality", value)}>
                    <SelectTrigger className="text-lg p-4">
                      <SelectValue placeholder="Select panel quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium (Higher efficiency, longer warranty)</SelectItem>
                      <SelectItem value="standard">Standard (Good efficiency, standard warranty)</SelectItem>
                      <SelectItem value="budget">Budget (Basic efficiency, shorter warranty)</SelectItem>
                      <SelectItem value="recommend">Let me recommend based on my needs</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.panelQuality && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.panelQuality.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Budget */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget">Budget range (₹)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 200000"
                    {...form.register("budget", { valueAsNumber: true })}
                    className="text-lg p-4"
                  />
                  {form.formState.errors.budget && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.budget.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subsidyInfo">Subsidy information (optional)</Label>
                  <Textarea
                    id="subsidyInfo"
                    placeholder="Any specific subsidy requirements or constraints..."
                    {...form.register("subsidyInfo")}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-4 pt-6">
              <Button
                type="button"
                onClick={nextStep}
                disabled={createAssessmentMutation.isPending || calculateMutation.isPending}
                className="flex-1 solar-gradient text-white font-semibold py-4 px-6 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {createAssessmentMutation.isPending || calculateMutation.isPending ? (
                  "Processing..."
                ) : currentStep === steps.length - 1 ? (
                  "Calculate My Solar System"
                ) : (
                  <>
                    <ArrowRight className="mr-2" size={16} />
                    Continue Assessment
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-6 py-4 transition-colors"
              >
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                className="px-6 py-4 transition-colors"
              >
                <RotateCcw className="mr-2" size={16} />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
