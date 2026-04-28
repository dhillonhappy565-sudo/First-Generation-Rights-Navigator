import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ArrowRight, Phone, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../api/client';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === 'otp' && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    }
  }, [step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/send-otp', { phone });
      setStep('otp');
      setTimer(30);
      setSuccess(`OTP sent to +91 ${phone}`);
      // For demo: show OTP in console
      if (res.data.otp_for_demo) {
        console.log('Demo OTP:', res.data.otp_for_demo);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newOtp.every(d => d !== '')) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace: go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpString) => {
    const code = otpString || otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: code });
      localStorage.setItem('userId', res.data.user._id);

      if (!res.data.user.name || !res.data.user.state) {
        navigate('/onboarding');
      } else {
        localStorage.setItem('userProfile', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError('');
    setOtp(['', '', '', '', '', '']);

    try {
      const res = await api.post('/auth/send-otp', { phone });
      setTimer(30);
      setSuccess('New OTP sent!');
      if (res.data.otp_for_demo) {
        console.log('Demo OTP:', res.data.otp_for_demo);
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-w-md w-full rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600" />
        
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                  <Phone size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome</h1>
                <p className="text-slate-500">Access your personalized government schemes</p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium border-r pr-2 border-slate-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-16 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                      maxLength={10}
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-70"
                >
                  <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <ShieldCheck size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Verify OTP</h1>
                <p className="text-slate-500">Enter the 6-digit code sent to</p>
                <p className="text-slate-800 font-semibold">+91 {phone}</p>
              </div>

              {success && (
                <p className="text-green-600 text-sm text-center mb-4 bg-green-50 p-2 rounded-lg">{success}</p>
              )}

              <div className="space-y-6">
                {/* OTP Input Boxes */}
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => otpRefs.current[idx] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    />
                  ))}
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                  onClick={() => handleVerifyOTP()}
                  disabled={loading || otp.some(d => d === '')}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-70"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Login'}</span>
                  {!loading && <ShieldCheck size={20} />}
                </button>

                {/* Resend & Change Number */}
                <div className="flex justify-between items-center text-sm">
                  <button
                    onClick={() => { setStep('phone'); setError(''); setSuccess(''); setOtp(['','','','','','']); }}
                    className="text-slate-500 hover:text-primary-600 transition-colors"
                  >
                    ← Change number
                  </button>
                  <button
                    onClick={handleResendOTP}
                    disabled={timer > 0 || loading}
                    className="text-primary-600 hover:text-primary-700 font-medium disabled:text-slate-400 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={14} />
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-center text-slate-400 text-xs mt-6">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
