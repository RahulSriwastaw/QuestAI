
import React from 'react';
import { Database } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-slate-200 py-2.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/10">
            <Database className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-bold text-dark font-display tracking-tight">
            Quest<span className="text-primary">AI</span>
          </span>
        </div>
        <div className="hidden sm:block text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Intelligent Extraction
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
