import React, { useEffect, useState } from 'react';
import { User, MapPin, Briefcase, IndianRupee, Save } from 'lucide-react';
import api from '../api/client';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    state: '',
    gender: '',
    age: '',
    occupation: '',
    income: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userString = localStorage.getItem('userProfile');
    if (userString) {
      const parsed = JSON.parse(userString);
      setFormData(parsed);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const userId = localStorage.getItem('userId');
      const res = await api.post('/user/profile', { userId, ...formData });
      localStorage.setItem('userProfile', JSON.stringify(res.data.user));
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto space-y-6 pb-20">
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
             <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Your Profile</h1>
            <p className="text-slate-500 text-sm">Update your details to get better scheme recommendations.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={18} /></span>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            {/* Phone (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                 <input 
                  type="text" value={formData.phone} disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><MapPin size={18} /></span>
                <select 
                  name="state" value={formData.state} onChange={handleChange} required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                >
                  <option value="">Select State</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
              <input 
                type="number" name="age" value={formData.age} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
              <select 
                name="gender" value={formData.gender} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Occupation</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Briefcase size={18} /></span>
                <select 
                  name="occupation" value={formData.occupation} onChange={handleChange} required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                >
                  <option value="">Select</option>
                  <option value="Student">Student</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Salaried">Salaried</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>
            </div>

            {/* Income */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Annual Income (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IndianRupee size={18} /></span>
                <input 
                  type="number" name="income" value={formData.income} onChange={handleChange} required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
             <button
               type="submit"
               disabled={loading}
               className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium flex items-center shadow-md transition-colors disabled:opacity-50"
             >
               <Save size={18} className="mr-2" />
               {loading ? 'Saving...' : 'Save Profile'}
             </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Profile;
