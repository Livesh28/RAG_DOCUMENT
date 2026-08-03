import React from 'react';
import { ShieldCheck, Sparkles, Activity, User, Lock } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'documents' | 'settings' | 'admin-upload';
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, role, setRole }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Student Information & RAG Q&A Assistant';
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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">{getTitle()}</h2>
        </div>
        <span className="text-[10px] bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-200 font-bold uppercase tracking-wider">
          MongoDB Atlas RAG
        </span>
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

        <div className="hidden lg:flex items-center gap-2 text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-semibold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Strict PDF Citations</span>
        </div>
      </div>
    </header>
  );
};
