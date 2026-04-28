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
    const schemes = await Scheme.find({});
    
    // Scoring Logic
    const scoredSchemes = schemes.map(scheme => {
      let score = 0;
      
      // State Match
      if (scheme.state === profile.state || scheme.state === 'Central' || scheme.state === 'All') {
        score += 2;
      }
      
      // Occupation Match
      if (scheme.eligibility?.occupation && scheme.eligibility.occupation.includes(profile.occupation)) {
        score += 2;
      }

      // Income Match (If user income is less than or equal to requirement)
      if (scheme.eligibility?.income?.max && profile.income) {
         if (profile.income <= scheme.eligibility.income.max) score += 1;
      }

      // Age Match
      if (scheme.eligibility?.age && profile.age) {
        if (
          (!scheme.eligibility.age.min || profile.age >= scheme.eligibility.age.min) &&
          (!scheme.eligibility.age.max || profile.age <= scheme.eligibility.age.max)
        ) {
          score += 1;
        }
      }

      // Tag match (mock basic word matching)
      if (scheme.tags && profile.purpose) {
        const purposeLower = profile.purpose.toLowerCase();
        for (const tag of scheme.tags) {
           if (purposeLower.includes(tag.toLowerCase())) score += 1;
        }
      }

      return { scheme, score };
    });

    // Sort descending by score
    scoredSchemes.sort((a, b) => b.score - a.score);

    // Return top 5
    res.json(scoredSchemes.slice(0, 5).map(s => s.scheme));

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
