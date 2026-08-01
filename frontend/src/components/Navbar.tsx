import React from 'react';
import { ShieldCheck, Sparkles, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'documents' | 'settings';
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'University RAG Information Assistant';
      case 'documents':
        return 'Document Knowledge Repository & Vector Indexing';
      case 'settings':
        return 'UniGuide AI Architecture & System Configuration';
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
          Executive RAG
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold shadow-sm">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>FastAPI Engine Online</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-semibold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Zero Hallucination Mode</span>
        </div>
      </div>
    </header>
  );
};
