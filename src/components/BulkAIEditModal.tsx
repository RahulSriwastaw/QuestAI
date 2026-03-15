import React, { useState } from 'react';
import { X, Loader2, AlertTriangle, Info } from 'lucide-react';

interface BulkAIEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (instruction: string) => void;
  selectedCount: number;
}

const EXAMPLES = [
  "Add a step-by-step solution to each question",
  "Simplify the language of each question for better clarity",
  "Add Hindi translation after each question and option",
  "Fix any grammatical errors in the questions and options",
  "Add context or hints to make each question clearer",
  "Convert all numerical values to SI units"
];

const BulkAIEditModal: React.FC<BulkAIEditModalProps> = ({ isOpen, onClose, onApply, selectedCount }) => {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setInstruction('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    setIsProcessing(true);
    onApply(instruction);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-dark tracking-tight">Bulk AI Edit</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Instruction</label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Enter your edit instruction (e.g., Add detailed step-by-step solution for each question)"
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-sm resize-none"
          />
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Example Instructions</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setInstruction(ex)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 text-[10px] font-bold rounded-lg transition-all border border-slate-100"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100">
          <div className="flex items-center gap-2 text-dark font-black text-xs uppercase tracking-wider">
            <Info size={14} className="text-primary" /> How it works
          </div>
          <ul className="text-[10px] text-slate-500 space-y-1.5 font-medium">
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              AI processes all questions in parallel batches for faster completion
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              Your instruction is applied to each question individually
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              Edits include question text, options, and solution
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-2xl text-[10px] font-bold leading-relaxed border border-amber-100">
          <AlertTriangle size={18} className="shrink-0" />
          Warning: This will modify all {selectedCount} selected questions. Make sure your instruction is correct. This action uses AI credits and changes are applied immediately.
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
            disabled={isProcessing || !instruction}
            className="flex-[2] px-5 py-3 bg-primary text-white font-black uppercase text-[11px] rounded-2xl hover:opacity-90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {isProcessing ? <><Loader2 className="animate-spin" size={14} /> Processing...</> : 'Apply Bulk Edit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAIEditModal;
