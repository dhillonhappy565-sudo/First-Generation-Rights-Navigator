import express from 'express';
import { extractUserData, generateExplanation } from '../services/aiService.js';
import Scheme from '../models/Scheme.js';

const router = express.Router();

// Simple regex-based extraction as fallback when AI is unavailable
const extractWithRegex = (message) => {
  const data = {};
  const msg = message.toLowerCase();

  // Extract age (English + Hindi patterns)
  const ageMatch = msg.match(/(\d{1,3})\s*(?:year|yr|age|साल|वर्ष|saal)/i) || msg.match(/age\s*(?:is|:)?\s*(\d{1,3})/i) || msg.match(/उम्र\s*(\d{1,3})/i);
  if (ageMatch) data.age = parseInt(ageMatch[1]);

  // Extract state (English + Hindi names)
  const stateMap = {
    'andhra pradesh': 'Andhra Pradesh', 'arunachal pradesh': 'Arunachal Pradesh', 'assam': 'Assam',
    'bihar': 'Bihar', 'बिहार': 'Bihar', 'chhattisgarh': 'Chhattisgarh', 'छत्तीसगढ़': 'Chhattisgarh',
    'goa': 'Goa', 'gujarat': 'Gujarat', 'गुजरात': 'Gujarat',
    'haryana': 'Haryana', 'हरियाणा': 'Haryana', 'himachal pradesh': 'Himachal Pradesh', 'हिमाचल प्रदेश': 'Himachal Pradesh',
    'jharkhand': 'Jharkhand', 'झारखंड': 'Jharkhand', 'karnataka': 'Karnataka', 'कर्नाटक': 'Karnataka',
    'kerala': 'Kerala', 'केरल': 'Kerala', 'madhya pradesh': 'Madhya Pradesh', 'मध्य प्रदेश': 'Madhya Pradesh',
    'maharashtra': 'Maharashtra', 'महाराष्ट्र': 'Maharashtra', 'manipur': 'Manipur', 'meghalaya': 'Meghalaya',
    'mizoram': 'Mizoram', 'nagaland': 'Nagaland', 'odisha': 'Odisha', 'ओडिशा': 'Odisha',
    'punjab': 'Punjab', 'पंजाब': 'Punjab', 'ਪੰਜਾਬ': 'Punjab',
    'rajasthan': 'Rajasthan', 'राजस्थान': 'Rajasthan', 'sikkim': 'Sikkim',
    'tamil nadu': 'Tamil Nadu', 'तमिलनाडु': 'Tamil Nadu',
    'telangana': 'Telangana', 'तेलंगाना': 'Telangana', 'tripura': 'Tripura',
    'uttar pradesh': 'Uttar Pradesh', 'उत्तर प्रदेश': 'Uttar Pradesh',
    'uttarakhand': 'Uttarakhand', 'उत्तराखंड': 'Uttarakhand',
    'west bengal': 'West Bengal', 'पश्चिम बंगाल': 'West Bengal',
    'delhi': 'Delhi', 'दिल्ली': 'Delhi',
  };
  for (const [key, value] of Object.entries(stateMap)) {
    if (message.includes(key) || msg.includes(key)) { data.state = value; break; }
  }

  // Extract gender (English + Hindi)
  if (msg.match(/\b(female|woman|girl|mahila|lady|महिला|लड़की|औरत)\b/i)) data.gender = 'Female';
  else if (msg.match(/\b(male|man|boy|पुरुष|लड़का|आदमी)\b/i)) data.gender = 'Male';

  // Extract occupation (English + Hindi)
  const occupationMap = {
    'farmer': 'Farmer', 'किसान': 'Farmer', 'ਕਿਸਾਨ': 'Farmer',
    'student': 'Student', 'विद्यार्थी': 'Student', 'छात्र': 'Student',
    'teacher': 'Teacher', 'शिक्षक': 'Teacher', 'अध्यापक': 'Teacher',
    'worker': 'Worker', 'मजदूर': 'Worker', 'श्रमिक': 'Worker',
    'labourer': 'Worker', 'मज़दूर': 'Worker',
    'self-employed': 'Self-employed', 'स्वरोजगार': 'Self-employed',
    'unemployed': 'Unemployed', 'बेरोजगार': 'Unemployed',
    'fisherman': 'Fisherman', 'मछुआरा': 'Fisherman',
    'artisan': 'Artisan', 'कारीगर': 'Artisan',
    'weaver': 'Weaver', 'बुनकर': 'Weaver',
  };
  for (const [key, value] of Object.entries(occupationMap)) {
    if (message.includes(key) || msg.includes(key)) { data.occupation = value; break; }
  }

  // Extract income
  const incomeMatch = msg.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l|लाख)\b/i);
  if (incomeMatch) data.income = parseFloat(incomeMatch[1]) * 100000;
  const incomeMatch2 = msg.match(/(?:income|earning|earn|आय|कमाई)\s*(?:is|:)?\s*(?:rs\.?|₹)?\s*(\d+)/i);
  if (!data.income && incomeMatch2) data.income = parseInt(incomeMatch2[1]);

  // Detect language
  if (message.match(/[\u0900-\u097F]/)) data.language = 'hi';
  else if (message.match(/[\u0A00-\u0A7F]/)) data.language = 'pa';
  else if (message.match(/[\u0B80-\u0BFF]/)) data.language = 'ta';
  else if (message.match(/[\u0C00-\u0C7F]/)) data.language = 'te';
  else if (message.match(/[\u0980-\u09FF]/)) data.language = 'bn';
  else data.language = 'en';

  return data;
};

// Flexible matching: check if value contains keyword
const containsKeyword = (value, keyword) => {
  if (!value || !keyword) return false;
  const kw = keyword.toLowerCase();
  if (Array.isArray(value)) return value.some(v => String(v).toLowerCase().includes(kw));
  return String(value).toLowerCase().includes(kw);
};

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Input message is required' });

  try {
    // 1. Extract data from chat input ONLY (not profile)
    let extractedData = await extractUserData(message);
    
    // Fallback to regex if AI fails
    if (!extractedData || Object.keys(extractedData).length === 0) {
      extractedData = extractWithRegex(message);
    }

    const searchProfile = extractedData;
    const userMessage = message.toLowerCase();

    // 2. Fetch ALL schemes and score based on CHAT INPUT only
    const schemes = await Scheme.find({}).lean();
    
    const scoredSchemes = schemes.map(scheme => {
      let score = 0;
      const raw = JSON.stringify(scheme).toLowerCase();

      // State Match
      if (searchProfile.state) {
        const userState = searchProfile.state.toLowerCase();
        const schemeState = (scheme.state || '').toLowerCase();
        if (schemeState === 'all' || schemeState === 'central' || schemeState === userState || schemeState.includes(userState)) {
          score += 4;
        }
      }

      // Occupation Match
      if (searchProfile.occupation) {
        const occ = searchProfile.occupation.toLowerCase();
        if (raw.includes(occ)) score += 4;
      }

      // Age Match
      if (searchProfile.age) {
        const age = Number(searchProfile.age);
        const elig = scheme.eligibility || {};
        
        if (elig.age) {
          if (typeof elig.age === 'object' && elig.age !== null) {
            const min = Number(elig.age.min) || 0;
            const max = Number(elig.age.max) || 150;
            if (age >= min && age <= max) score += 3;
          } else {
            const ageStr = String(elig.age);
            const rangeMatch = ageStr.match(/(\d+)\s*[-–to]+\s*(\d+)/);
            if (rangeMatch && age >= Number(rangeMatch[1]) && age <= Number(rangeMatch[2])) score += 3;
            if (ageStr.includes('>') || ageStr.includes('above')) {
              const num = Number(ageStr.replace(/\D/g, ''));
              if (num && age >= num) score += 3;
            }
          }
        }
        
        // Senior citizen boost
        if (age >= 60 && (raw.includes('senior') || raw.includes('old age') || raw.includes('pension') || raw.includes('elderly') || raw.includes('vridha') || raw.includes('vayo'))) {
          score += 5;
        }
      }

      // Gender Match
      if (searchProfile.gender) {
        if (raw.includes(searchProfile.gender.toLowerCase())) score += 2;
      }

      // Direct keyword matching from the user message
      const keywords = userMessage.split(/\s+/).filter(w => w.length > 3);
      for (const kw of keywords) {
        if (raw.includes(kw)) score += 1;
      }

      return { scheme, score };
    });

    scoredSchemes.sort((a, b) => b.score - a.score);
    const topSchemes = scoredSchemes.filter(s => s.score > 0).slice(0, 5).map(s => s.scheme);
    const finalSchemes = topSchemes.length > 0 ? topSchemes : scoredSchemes.slice(0, 3).map(s => s.scheme);

    // 3. Generate AI explanation (or build a local one if AI fails)
    let explanation;
    try {
      explanation = await generateExplanation(message, finalSchemes, extractedData);
    } catch (e) {
      const extracted = Object.entries(extractedData).map(([k, v]) => `${k}: ${v}`).join(', ');
      const schemeNames = finalSchemes.map(s => s.scheme_name).join(', ');
      explanation = `Based on your input (${extracted}), I found these relevant schemes for you: ${schemeNames}. Tap on any scheme below to see full details about eligibility, benefits, and how to apply!`;
    }

    res.json({
      extractedData,
      recommendedSchemes: finalSchemes,
      explanation
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: 'Chat interaction failed', error: error.message });
  }
});

export default router;
