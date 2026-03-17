import React, { useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (tags: string[], mode: 'add' | 'replace') => void;
  selectedCount: number;
}

const BulkTagModal: React.FC<BulkTagModalProps> = ({ isOpen, onClose, onApply, selectedCount }) => {
  const [tagInput, setTagInput] = useState('');
  const [mode, setMode] = useState<'add' | 'replace'>('add');

  React.useEffect(() => {
    if (isOpen) {
      setTagInput('');
      setMode('add');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    const tags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    onApply(tags, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] w-full max-w-lg p-10 space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
              <Tag size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight font-display">Bulk Intelligence Tagging</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Apply metadata to {selectedCount} items</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Metadata Tags (Comma Separated)</label>
            <div className="relative group">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. quantum_physics, advanced_level, 2025_curriculum"
                className="w-full p-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all font-bold text-sm placeholder:text-slate-300"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMode('add')}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${mode === 'add' ? 'border-primary bg-primary/5 text-primary shadow-xl shadow-primary/5' : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${mode === 'add' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                <Plus size={20} />
              </div>
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-widest block">Append Mode</span>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-tighter">Maintain existing tags</span>
              </div>
            </button>
            <button 
              onClick={() => setMode('replace')}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${mode === 'replace' ? 'border-red-500 bg-red-50 text-red-500 shadow-xl shadow-red-500/5' : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${mode === 'replace' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <X size={20} />
              </div>
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-widest block">Overwrite Mode</span>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-tighter text-red-400">Purge current metadata</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4 relative z-10">
          <button 
            onClick={onClose} 
            className="flex-1 px-8 py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest hover:text-dark transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleApply}
            disabled={!tagInput.trim() && mode === 'add'}
            className={`flex-[2] px-8 py-5 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl transition-all shadow-2xl ${mode === 'replace' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-primary hover:opacity-90 shadow-primary/30'} disabled:opacity-50 disabled:shadow-none active:scale-95`}
          >
            Execute Bulk Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkTagModal;
