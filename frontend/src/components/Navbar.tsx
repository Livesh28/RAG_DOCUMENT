import React from 'react';
import { ShieldCheck, Sparkles, Activity, User, Lock, Calculator, Compass, BookOpen } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'predictor' | 'documents' | 'settings' | 'admin-upload';
  setActiveTab: (tab: 'dashboard' | 'predictor' | 'documents' | 'settings' | 'admin-upload') => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, role, setRole }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Student Information & RAG Q&A Assistant';
      case 'predictor':
        return 'JEE Marks & Rank College Predictor Tool';
      case 'documents':
        return 'University Knowledge Base & Documents';
      case 'admin-upload':
        return 'Admin PDF Document & Ingestion Manager';
      case 'settings':
        return 'UniGuide AI System & MongoDB Atlas Configuration';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight hidden sm:block">{getTitle()}</h2>
        </div>

        {/* Top Navbar Nav Links matching UI reference */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              activeTab === 'dashboard' ? 'bg-white text-brand-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home / Chat
          </button>

          <button
            onClick={() => setActiveTab('predictor')}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'predictor' ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm' : 'text-slate-700 font-extrabold hover:text-brand-600'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Predictor</span>
          </button>

          <button
            onClick={() => setActiveTab('predictor')}
            className="px-3 py-1 text-slate-600 hover:text-slate-900 font-bold transition flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Choice Filler</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              activeTab === 'documents' ? 'bg-white text-brand-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scholarships & PDFs
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {/* Role Switcher Button */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setRole('student')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-all duration-150 ${
              role === 'student'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-brand-600" />
            <span>Student Mode</span>
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-all duration-150 ${
              role === 'admin'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Mode</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold shadow-sm">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>FastAPI Engine Online</span>
        </div>
      </div>
    </header>
  );
};

