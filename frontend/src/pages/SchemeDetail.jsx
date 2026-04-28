import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, IndianRupee, MapPin, Target, Volume2 } from 'lucide-react';
import api from '../api/client';
import { speakText } from '../utils/tts';

const SchemeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const res = await api.get(`/schemes/${id}`);
        setScheme(res.data);
      } catch (err) {
        console.error("Failed to fetch scheme", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
  }, [id]);

  if (loading) return (
     <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );
  if (!scheme) return <p className="text-center text-slate-500 mt-10">Scheme not found.</p>;

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6 pb-20">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-primary-600 transition-colors mb-4"
      >
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-50 rounded-full blur-3xl"></div>
        <div className="flex justify-between items-start relative z-10 mb-4">
           <span className="bg-primary-100 text-primary-700 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
             {scheme.category || 'General'}
           </span>
           <button 
             onClick={() => speakText(`You are viewing details for ${scheme.scheme_name}. Benefits include: ${scheme.benefits}`)}
             className="text-slate-400 hover:text-primary-600 bg-slate-50 p-2 rounded-full transition-colors"
           >
             <Volume2 size={20} />
           </button>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight mb-4 relative z-10">
          {scheme.scheme_name}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
          <div className="flex items-center"><MapPin size={16} className="mr-1 text-slate-400" /> {scheme.state}</div>
          <div className="flex items-center"><Target size={16} className="mr-1 text-slate-400" /> {scheme.level}</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col - Benefits & Eligibility */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4">
               <IndianRupee className="mr-2 text-primary-500" /> Benefits
            </h2>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {scheme.benefits}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4">
               <CheckCircle2 className="mr-2 text-green-500" /> Eligibility
            </h2>
            <ul className="space-y-3 relative text-slate-600">
              {scheme.eligibility && typeof scheme.eligibility === 'object' ? (
                Object.entries(scheme.eligibility).map(([key, value]) => (
                  <li key={key} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
                    <span className="capitalize">
                      <strong>{key}:</strong>{' '}
                      {Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                    </span>
                  </li>
                ))
              ) : scheme.eligibility ? (
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
                  <span>{String(scheme.eligibility)}</span>
                </li>
              ) : (
                <li className="text-slate-400 text-sm">No eligibility information available.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Col - Docs & Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-primary-50 to-white rounded-3xl p-6 border border-primary-100 shadow-sm">
            <h2 className="text-xl font-bold text-primary-800 flex items-center mb-4">
               <FileText className="mr-2 text-primary-500" /> Documents
            </h2>
            <ul className="space-y-3">
              {(Array.isArray(scheme.documents) ? scheme.documents : [scheme.documents]).filter(Boolean).map((doc, idx) => (
                <li key={idx} className="flex items-start text-sm font-medium text-slate-700">
                  <CheckCircle2 size={16} className="mr-2 mt-0.5 text-primary-500 shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <button className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-lg transition-colors flex justify-center items-center">
            How to Apply <ArrowRight size={18} className="ml-2" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default SchemeDetail;
