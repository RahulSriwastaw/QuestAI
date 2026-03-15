import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-dark flex items-center gap-2 tracking-tight">
            <Tag size={20} className="text-primary" /> Bulk Tag Questions
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tags (comma separated)</label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. physics, kinematics, easy"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-sm"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setMode('add')}
              className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${mode === 'add' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
            >
              <span className="text-xs font-black uppercase tracking-wider">Add Tags</span>
              <span className="text-[9px] font-bold opacity-60">Append to existing</span>
            </button>
            <button 
              onClick={() => setMode('replace')}
              className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${mode === 'replace' ? 'border-red-500 bg-red-50 text-red-500' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
            >
              <span className="text-xs font-black uppercase tracking-wider">Replace Tags</span>
              <span className="text-[9px] font-bold opacity-60">Overwrite all tags</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose} 
            className="flex-1 px-5 py-3 text-slate-500 font-black uppercase text-[11px] hover:text-dark transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleApply}
            disabled={!tagInput.trim() && mode === 'add'}
            className={`flex-[2] px-5 py-3 text-white font-black uppercase text-[11px] rounded-2xl transition-all shadow-lg ${mode === 'replace' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:opacity-90 shadow-primary/20'} disabled:opacity-50 disabled:shadow-none`}
          >
            Apply to {selectedCount} Questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkTagModal;
