import OpenAI from "openai";

// Check if OpenAI API key is properly configured
const openaiApiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR;

const openai = openaiApiKey && openaiApiKey !== "default_key" 
  ? new OpenAI({ apiKey: openaiApiKey })
  : null;

export async function getChatResponse(message: string, context?: any): Promise<string> {
  try {
    // If OpenAI is not configured, use fallback responses
    if (!openai) {
      return getFallbackResponse(message.toLowerCase());
    }

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
    // Fallback responses for common solar queries
    return getFallbackResponse(message.toLowerCase());
  }
}

function getFallbackResponse(message: string): string {
  if (message.includes('subsidy') || message.includes('scheme')) {
    return `Under PM Surya Ghar Yojana, you can get up to ₹78,000 central subsidy plus state subsidies. For 1-3kW: ₹14,588/kW, above 3kW: ₹7,294/kW. State subsidies vary by location. Would you like specific subsidy details for your area?`;
  }
  
  if (message.includes('financing') || message.includes('loan') || message.includes('emi')) {
    return `Solar financing options in India include: 1) Solar loans at 8.5-12% interest (HDFC, SBI, ICICI), 2) Zero down payment schemes, 3) CAPEX model (own the system), 4) Leasing/PPA models. Which option interests you most?`;
  }
  
  if (message.includes('vendor') || message.includes('installer')) {
    return `We connect you with MNRE-approved solar installers in your area. Look for vendors with proper certifications, good ratings, comprehensive warranties, and transparent pricing. Would you like to compare vendors for your location?`;
  }
  
  if (message.includes('savings') || message.includes('roi')) {
    return `Solar systems typically pay for themselves in 4-7 years in India. Annual savings depend on your electricity consumption, local tariffs, and system size. A 3kW system can save ₹30,000-50,000 annually. What's your monthly electricity bill?`;
  }
  
  if (message.includes('installation') || message.includes('process')) {
    return `Solar installation process: 1) Site survey (1-2 days), 2) Design & approvals (2-3 weeks), 3) Installation (2-3 days), 4) Grid connection & commissioning (1-2 weeks). Total timeline: 4-6 weeks. Need help with any specific step?`;
  }
  
  if (message.includes('maintenance')) {
    return `Solar panels need minimal maintenance: monthly cleaning, annual professional inspection, monitoring through app. Maintenance cost: ₹2,000-5,000/year. Most systems come with 25-year warranties. Any specific maintenance concerns?`;
  }
  
  return `Hello! I'm your Valency Solar Assistant. I can help with solar system sizing, government subsidies, financing options, vendor selection, and installation guidance. What would you like to know about going solar?`;
}

export async function getSolarRecommendation(assessmentData: any): Promise<string> {
  try {
    // If OpenAI is not configured, use fallback recommendation
    if (!openai) {
      return "Your solar assessment shows excellent potential for savings and clean energy generation!";
    }

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
