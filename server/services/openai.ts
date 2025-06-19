import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function getChatResponse(message: string, context?: any): Promise<string> {
  try {
    const systemPrompt = `You are Valency Solar Assistant, India's leading AI guide for solar energy solutions. You provide hyper-localized recommendations and comprehensive support throughout the solar journey.

    CORE EXPERTISE:
    - Hyper-localized solar recommendations based on pincode-level data
    - State and central government subsidy guidance
    - Comprehensive financing options (CAPEX, loans, leasing, PPA)
    - Vendor comparison and selection assistance
    - Installation timeline and process guidance
    - ROI analysis and savings projections
    - Maintenance and performance monitoring

    LOCATION-SPECIFIC GUIDANCE:
    - Different states have varying subsidy rates and incentives
    - Local electricity tariffs affect savings calculations
    - Regional solar irradiance impacts system performance
    - State-specific net metering policies
    - Local vendor ecosystems and pricing

    FINANCING EXPERTISE:
    - Solar loans: HDFC (8.5-12%), SBI (9-11.5%), ICICI (10.5-16%)
    - CAPEX vs OPEX models comparison
    - EMI calculations and savings analysis
    - Zero down payment options
    - Government scheme financing

    RESPONSE STYLE:
    - Always use Indian context and ₹ currency
    - Provide specific, actionable advice
    - Include relevant numbers and calculations when possible
    - Reference local policies and incentives
    - Be encouraging but realistic about solar benefits
    - Ask clarifying questions when needed to provide better guidance`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your request right now. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm having trouble connecting right now. Please try again in a moment, or continue with your solar assessment.";
  }
}

export async function getSolarRecommendation(assessmentData: any): Promise<string> {
  try {
    const prompt = `Based on this solar assessment data, provide a brief summary of the solar recommendation:
    
    Location: ${assessmentData.pincode}
    Energy Consumption: ${assessmentData.energyConsumption} kWh/month
    Roof Space: ${assessmentData.roofSpace} sq ft
    System Size: ${assessmentData.systemSize} kW
    Total Cost: ₹${assessmentData.totalCost}
    Subsidy: ₹${assessmentData.subsidy}
    Final Cost: ₹${assessmentData.finalCost}
    Annual Savings: ₹${assessmentData.annualSavings}
    ROI: ${assessmentData.roiYears} years
    
    Provide a brief, encouraging summary of this solar recommendation in 2-3 sentences.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Great solar potential for your location!";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Your solar assessment shows excellent potential for savings and clean energy generation!";
  }
}
