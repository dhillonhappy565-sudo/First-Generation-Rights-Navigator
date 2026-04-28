import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Briefcase, IndianRupee, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

const questions = [
  { id: 'name', label: "What's your full name?", icon: User, type: 'text', placeholder: 'Kiran Kumar' },
  { id: 'state', label: 'Which state do you live in?', icon: MapPin, type: 'select', options: ['Haryana', 'Punjab', 'Delhi', 'Maharashtra', 'Karnataka', 'Other'] },
  { id: 'gender', label: 'What is your gender?', icon: User, type: 'select', options: ['Male', 'Female', 'Other'] },
  { id: 'age', label: 'How old are you?', icon: User, type: 'number', placeholder: '25' },
  { id: 'occupation', label: 'What is your occupation?', icon: Briefcase, type: 'select', options: ['Student', 'Farmer', 'Self-employed', 'Salaried', 'Unemployed'] },
  { id: 'income', label: 'What is your annual family income?', icon: IndianRupee, type: 'number', placeholder: '150000' }
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      // Submit form
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        const res = await api.post('/user/profile', { userId, ...formData });
        localStorage.setItem('userProfile', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } catch (err) {
        console.error("Failed to save profile", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const currentQ = questions[step];
  const Icon = currentQ.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full mb-12 overflow-hidden">
          <motion.div 
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="glass p-8 md:p-12 rounded-3xl relative overflow-hidden min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-4 mb-6">
                 <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                    <Icon size={24} />
                 </div>
                 <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{currentQ.label}</h2>
              </div>

              {currentQ.type === 'select' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentQ.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFormData({ ...formData, [currentQ.id]: opt })}
                      className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
                        formData[currentQ.id] === opt 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-slate-200 bg-white hover:border-primary-200 text-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type={currentQ.type}
                  placeholder={currentQ.placeholder}
                  value={formData[currentQ.id] || ''}
                  onChange={(e) => setFormData({ ...formData, [currentQ.id]: e.target.value })}
                  className="w-full text-xl p-4 border-b-2 border-slate-200 focus:border-primary-500 outline-none bg-transparent transition-colors"
                  autoFocus
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 0}
            className="px-6 py-3 font-medium text-slate-500 disabled:opacity-50"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={loading || !formData[currentQ.id]}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium flex items-center shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : step === questions.length - 1 ? 'Finish' : 'Next'}
            {!loading && step === questions.length - 1 && <CheckCircle2 className="ml-2" size={20} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
