import express from 'express';
import { extractUserData, generateExplanation } from '../services/aiService.js';
import Scheme from '../models/Scheme.js';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  const { message, profile } = req.body;
  if (!message) return res.status(400).json({ message: 'Input message is required' });

  try {
    // 1. Core Logic: Extract structured JSON data
    let extractedData = await extractUserData(message);
    if (!extractedData) {
        extractedData = {}; // Fallback empty
    }

    // 2. Merge extracted info with current profile context
    const searchProfile = { ...profile, ...extractedData };

    // 3. Instead of re-implementing matching, we can call our own recommend logic here
    // But since we are inside express, we can just do the logic:
    const schemes = await Scheme.find({});
    const scoredSchemes = schemes.map(scheme => {
      let score = 0;
      if (scheme.state === searchProfile.state || scheme.state === 'Central' || scheme.state === 'All') score += 2;
      if (scheme.eligibility?.occupation && searchProfile.occupation && scheme.eligibility.occupation.includes(searchProfile.occupation)) score += 2;
      if (scheme.eligibility?.income?.max && searchProfile.income && searchProfile.income <= scheme.eligibility.income.max) score += 1;
      if (scheme.eligibility?.age && searchProfile.age) {
        if (
          (!scheme.eligibility.age.min || searchProfile.age >= scheme.eligibility.age.min) &&
          (!scheme.eligibility.age.max || searchProfile.age <= scheme.eligibility.age.max)
        ) score += 1;
      }
      return { scheme, score };
    });

    scoredSchemes.sort((a, b) => b.score - a.score);
    const topSchemes = scoredSchemes.slice(0, 3).map(s => s.scheme);

    // 4. Generate human explanation
    const explanation = await generateExplanation(message, topSchemes);

    res.json({
      extractedData,
      recommendedSchemes: topSchemes,
      explanation
    });

  } catch (error) {
    res.status(500).json({ message: 'Chat interaction failed', error: error.message });
  }
});

export default router;
