import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const extractUserData = async (message) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping a user find government schemes. 
          Extract structured user information from the input message and return ONLY JSON.
          Schema: {
            "age": number (optional),
            "gender": "Male" | "Female" | "Other" (optional),
            "state": string (optional),
            "occupation": string (optional),
            "income": number (optional)
          }
          Ensure there is no extra text around the JSON, no markdown formatting like \`\`\`json. Just the raw JSON object. If you cannot find info for a field, omit it.`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const content = response.choices[0].message.content.trim();
    // Safely parse JSON
    return JSON.parse(content);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return null;
  }
};

export const generateExplanation = async (userMessage, recommendedSchemes) => {
  try {
    const schemeNames = recommendedSchemes.map(s => s.scheme_name).join(', ');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
           role: "system",
           content: `You are a helpful government scheme assistant. 
           The user asked a question. Based on their profile and question, the system matched them with these schemes: ${schemeNames}.
           Provide a short, human-readable explanation of why they might be eligible and briefly recommend checking them out.`
        },
        {
           role: "user",
           content: userMessage
        }
      ]
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return "These schemes matched your profile based on our records.";
  }
};
