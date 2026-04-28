import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Update user profile (Onboarding)
router.post('/profile', async (req, res) => {
  const { userId, ...profileData } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, profileData, { new: true });
    if (!user) {
       return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
