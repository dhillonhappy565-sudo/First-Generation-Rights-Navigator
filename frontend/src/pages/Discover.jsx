import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import api from '../api/client';
import { speakText } from '../utils/tts';

const Discover = () => {
  const [schemes, setSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllSchemes = async () => {
      try {
        // Fetch the raw list of all schemes regardless of user profile
        const res = await api.get('/schemes');
        setSchemes(res.data);
      } catch (err) {
        console.error("Failed to load schemes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSchemes();
  }, []);

  // Compute unique categories from the fetched schemes
  const categories = [...new Set(schemes.map(s => s.category).filter(Boolean))];

  // Filter schemes based on search text and category dropdown
  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.scheme_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scheme.benefits.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || scheme.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
     <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header section with search and filtering */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-4">Discover All Schemes</h1>
        <p className="text-slate-300 mb-8 max-w-xl">
          Browse through the complete database of government schemes, grants, and subsidies.
        </p>

        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
               <Search size={20} />
            </span>
            <input 
              type="text" 
              placeholder="Search by name or benefits..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none backdrop-blur-sm transition-all"
            />
          </div>
          <div className="relative md:w-64">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
               <Filter size={20} />
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Showing {filteredSchemes.length} result{filteredSchemes.length !== 1 ? 's' : ''}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.length === 0 ? (
            <div className="col-span-full bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
              No schemes found matching your filters.
            </div>
          ) : (
            filteredSchemes.map((scheme) => (
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

export default Discover;
