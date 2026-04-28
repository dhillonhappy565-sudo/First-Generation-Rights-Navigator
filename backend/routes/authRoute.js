import express from 'express';
import axios from 'axios';
import User from '../models/User.js';

const router = express.Router();

// In-memory OTP store (in production, use Redis)
const otpStore = new Map();

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Fast2SMS
const sendSMS = async (phone, otp) => {
  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        variables_values: otp,
        route: 'otp',
        numbers: phone,
      },
      headers: {
        'cache-control': 'no-cache',
      },
      // Bypass SSL certificate issues on restricted networks
      httpsAgent: new (await import('https')).Agent({ rejectUnauthorized: false }),
      timeout: 10000,
    });
    console.log(`📱 SMS Response:`, response.data);
    return response.data.return;
  } catch (error) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    return false;
  }
};

// Step 1: Send OTP to phone number
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ message: 'Valid phone number is required' });
  }

  try {
    const otp = generateOTP();
    
    // Store OTP with 5-minute expiry
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    // Send real SMS via Fast2SMS
    const sent = await sendSMS(phone, otp);
    
    if (sent) {
      console.log(`✅ OTP for ${phone}: ${otp}`);
      res.json({ message: 'OTP sent successfully to your phone!' });
    } else {
      // Fallback: still allow login with console OTP if SMS fails
      console.log(`⚠️ SMS failed but OTP for ${phone}: ${otp}`);
      res.json({ message: 'OTP sent! (Check console if SMS not received)', otp_for_demo: otp });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// Step 2: Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }

  try {
    const stored = otpStore.get(phone);

    if (!stored) {
      return res.status(400).json({ message: 'OTP expired or not requested. Please request a new OTP.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (stored.attempts >= 5) {
      otpStore.delete(phone);
      return res.status(429).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    if (stored.otp !== otp) {
      stored.attempts += 1;
      return res.status(400).json({ message: `Invalid OTP. ${5 - stored.attempts} attempts remaining.` });
    }

    // OTP verified! Clean up
    otpStore.delete(phone);

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }

    res.json({
      message: 'OTP verified successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

export default router;
