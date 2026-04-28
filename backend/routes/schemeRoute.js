import express from 'express';
import Scheme from '../models/Scheme.js';
import User from '../models/User.js';

const router = express.Router();

// Get all schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find({});
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get scheme by ID
router.get('/:id', async (req, res) => {
  try {
    let scheme = await Scheme.findById(req.params.id).catch(() => null);
    
    // Fallback: If Mongoose strict ObjectId casting failed, try to find it as a raw string
    if (!scheme) {
      scheme = await Scheme.collection.findOne({ _id: req.params.id });
    }

    if (scheme) {
      res.json(scheme);
    } else {
      res.status(404).json({ message: 'Scheme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Recommendation Engine
router.post('/recommend', async (req, res) => {
  const { profile } = req.body;
  
  if (!profile) {
    return res.status(400).json({ message: 'User profile is required' });
  }

  try {
    const schemes = await Scheme.find({}).lean();
    
    const scoredSchemes = schemes.map(scheme => {
      let score = 0;
      const raw = JSON.stringify(scheme).toLowerCase();

      // State Match
      if (profile.state) {
        const userState = profile.state.toLowerCase();
        const schemeState = (scheme.state || '').toLowerCase();
        if (schemeState === 'all' || schemeState === 'central' || schemeState === userState || schemeState.includes(userState)) {
          score += 3;
        }
      }

      // Occupation Match
      if (profile.occupation) {
        const occ = profile.occupation.toLowerCase();
        const eligStr = JSON.stringify(scheme.eligibility || {}).toLowerCase();
        if (eligStr.includes(occ)) score += 3;
        if (scheme.tags && Array.isArray(scheme.tags) && scheme.tags.some(t => t.toLowerCase().includes(occ))) score += 2;
      }

      // Age Match
      if (profile.age) {
        const age = Number(profile.age);
        const elig = scheme.eligibility || {};
        if (elig.age) {
          if (typeof elig.age === 'object' && elig.age !== null) {
            const min = Number(elig.age.min) || 0;
            const max = Number(elig.age.max) || 150;
            if (age >= min && age <= max) score += 2;
          } else {
            const ageStr = String(elig.age);
            const rangeMatch = ageStr.match(/(\d+)\s*[-–to]+\s*(\d+)/);
            if (rangeMatch && age >= Number(rangeMatch[1]) && age <= Number(rangeMatch[2])) score += 2;
          }
        }
        if (age >= 60 && (raw.includes('senior') || raw.includes('old age') || raw.includes('pension') || raw.includes('elderly'))) {
          score += 3;
        }
      }

      // Gender Match
      if (profile.gender) {
        const g = profile.gender.toLowerCase();
        const eligStr = JSON.stringify(scheme.eligibility || {}).toLowerCase();
        if (eligStr.includes(g)) score += 1;
      }

      return { scheme, score };
    });

    scoredSchemes.sort((a, b) => b.score - a.score);
    res.json(scoredSchemes.slice(0, 5).map(s => s.scheme));

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

