import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export const extractUserData = async (message) => {
  try {
    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-4-scout:free",
      messages: [
        {
          role: "system",
          content: `You are an intelligent multilingual AI assistant for Indian government schemes.

The user may write in ANY language — Hindi, English, Punjabi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Malayalam, Odia, or any other Indian language. You MUST understand the message regardless of language.

Your job: Extract structured user details from the message. Return ONLY a JSON object:
{
  "age": number,
  "gender": "Male" | "Female" | "Other",
  "state": "state name in English",
  "occupation": "occupation in English",
  "income": number (annual in rupees),
  "category": "General" | "SC" | "ST" | "OBC" | "Minority",
  "disability": true/false,
  "bpl": true/false,
  "language": "detected language code (hi/en/pa/ta/te/mr/bn/gu/kn/ml/od/ur)"
}

Rules:
- Return ONLY raw JSON. No markdown, no explanation.
- Always detect and include the "language" field.
- Convert all extracted values to English (e.g. "किसान" → occupation: "Farmer", "हिमाचल प्रदेश" → state: "Himachal Pradesh")
- Convert income in lakhs to full number (1.5L = 150000)
- If "बुजुर्ग" or "वृद्ध" or "senior citizen", set appropriate age (65+)
- Omit any field you cannot determine`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const content = response.choices[0].message.content.trim();
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return null;
  }
};

export const generateExplanation = async (userMessage, recommendedSchemes, extractedData) => {
  try {
    const schemeDetails = recommendedSchemes.map(s => 
      `- ${s.scheme_name} (${s.category || 'General'}): ${s.benefits}`
    ).join('\n');
    
    const extractedInfo = extractedData ? JSON.stringify(extractedData) : 'not available';
    const detectedLang = extractedData?.language || 'en';

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-4-scout:free",
      messages: [
        {
          role: "system",
          content: `You are "Rights Navigator AI" — a friendly, multilingual Indian government scheme advisor chatbot.

CRITICAL RULE: You MUST reply in the SAME LANGUAGE the user wrote in. 
- If the user wrote in Hindi, reply in Hindi.
- If the user wrote in Punjabi, reply in Punjabi.
- If the user wrote in Tamil, reply in Tamil.
- If the user wrote in English, reply in English.
- The detected language is: ${detectedLang}

From the user's message, we extracted: ${extractedInfo}

The system found these matching schemes:
${schemeDetails}

Your job:
1. Greet/acknowledge the user warmly IN THEIR LANGUAGE
2. Briefly explain WHY each scheme is relevant to their situation
3. Mention key benefits
4. Encourage them to tap on a scheme card below for full details
5. If the user said "hello", "namaste", "sat sri akal", etc., introduce yourself and your capabilities IN THEIR LANGUAGE

Keep response concise (3-5 sentences), warm, and helpful.`
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
    
    // Smart multilingual fallback
    const schemeNames = recommendedSchemes.map(s => s.scheme_name).join(', ');
    const parts = [];
    
    if (extractedData?.age) parts.push(`age ${extractedData.age}`);
    if (extractedData?.state) parts.push(`from ${extractedData.state}`);
    if (extractedData?.occupation) parts.push(`${extractedData.occupation}`);
    if (extractedData?.gender) parts.push(`${extractedData.gender}`);
    
    const detectedLang = extractedData?.language || 'en';
    
    if (detectedLang === 'hi') {
      const info = parts.length > 0 ? ` (${parts.join(', ')})` : '';
      return `आपकी जानकारी${info} के आधार पर, ये सरकारी योजनाएं आपके लिए उपयुक्त हैं: ${schemeNames}। पूरी जानकारी के लिए नीचे किसी भी योजना पर टैप करें!`;
    }
    
    if (detectedLang === 'pa') {
      const info = parts.length > 0 ? ` (${parts.join(', ')})` : '';
      return `ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ${info} ਦੇ ਆਧਾਰ 'ਤੇ, ਇਹ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਤੁਹਾਡੇ ਲਈ ਢੁਕਵੀਆਂ ਹਨ: ${schemeNames}। ਪੂਰੀ ਜਾਣਕਾਰੀ ਲਈ ਹੇਠਾਂ ਕਿਸੇ ਵੀ ਯੋਜਨਾ 'ਤੇ ਟੈਪ ਕਰੋ!`;
    }
    
    if (parts.length > 0) {
      return `Based on your query (${parts.join(', ')}), I found these relevant schemes: ${schemeNames}. Tap on any scheme below for complete details!`;
    }
    
    return `Here are schemes matching your query: ${schemeNames}. Tap any scheme below for details!`;
  }
};
