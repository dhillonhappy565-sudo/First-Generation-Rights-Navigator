import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Mock Auth: Provide phone, returns token/user
router.post('/login', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }
    
    // In a real app, generate a JWT token. This is mock OTP logic.
    res.json({
      message: 'Login successful',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
