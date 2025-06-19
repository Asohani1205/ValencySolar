import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function getChatResponse(message: string, context?: any): Promise<string> {
  try {
    const systemPrompt = `You are Valency Solar Assistant, an expert AI guide for solar energy solutions. 
    You help users understand solar benefits, costs, financing options, installation processes, and maintenance.
    
    Key areas you can help with:
    - Solar system sizing and calculations
    - Government subsidies and incentives
    - Financing and loan options
    - Installation process and timeline
    - Maintenance and monitoring
    - ROI calculations and savings projections
    - Connecting with certified installers
    
    Provide helpful, accurate, and encouraging responses. Always be supportive of users' solar journey.
    Keep responses concise but informative. Use Indian context and currency (₹) when discussing costs.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
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
