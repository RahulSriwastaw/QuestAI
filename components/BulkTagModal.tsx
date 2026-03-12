import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (tags: string[]) => void;
  selectedCount: number;
}

const BulkTagModal: React.FC<BulkTagModalProps> = ({ isOpen, onClose, onApply, selectedCount }) => {
  const [tagInput, setTagInput] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setTagInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    const tags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    onApply(tags);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Tag size={20} /> Bulk Tag Questions
          </h2>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tags (comma separated)</label>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g. physics, kinematics, easy"
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl">Cancel</button>
          <button 
            onClick={handleApply}
            className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-secondary"
          >
            Apply Tags to {selectedCount} Questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkTagModal;
