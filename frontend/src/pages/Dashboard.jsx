import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import api from '../api/client';
import { speakText } from '../utils/tts';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userString = localStorage.getItem('userProfile');
    if (userString) {
      const parsed = JSON.parse(userString);
      setProfile(parsed);
      fetchRecommendations(parsed);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchRecommendations = async (userProfile) => {
    try {
      const res = await api.post('/schemes/recommend', { profile: userProfile });
      setSchemes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) return (
     <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-dark-900 to-primary-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl">
           <div className="w-40 h-40 bg-primary-400 rounded-full" />
         </div>
         <h1 className="text-3xl font-bold mb-2">Hello, {profile.name}! 👋</h1>
         <p className="text-primary-100 max-w-xl">
           Based on your profile ({profile.occupation} in {profile.state}), we've curated government schemes meant for you.
         </p>
         <button 
           onClick={() => navigate('/chat')}
           className="mt-6 bg-white shrink-0 text-primary-900 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
         >
           <Sparkles size={18} className="text-amber-500" />
           <span>Ask AI Assistant</span>
         </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-slate-800">Top Schemes For You</h2>
           <button className="text-primary-600 text-sm font-medium hover:underline">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.length === 0 ? (
            <p className="text-slate-500 col-span-full">No exact matches yet. Try browsing all schemes.</p>
          ) : (
            schemes.map((scheme, idx) => (
              <div 
                key={scheme._id} 
                onClick={() => navigate(`/scheme/${scheme._id}`)}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {scheme.category || 'General'}
                  </div>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      speakText(`${scheme.scheme_name}. Benefits include: ${scheme.benefits}`); 
                    }}
                    className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-full transition-colors"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{scheme.scheme_name}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">{scheme.benefits}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="flex items-center text-xs text-slate-400 font-medium space-x-1">
                    <BookOpen size={14} />
                    <span>{scheme.state}</span>
                  </span>
                  
                  <button 
                    onClick={() => navigate(`/scheme/${scheme._id}`)}
                    className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700"
                  >
                    Details <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
