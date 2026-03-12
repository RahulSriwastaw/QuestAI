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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800">Bulk AI Edit</h2>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Enter your edit instruction (e.g., Add detailed step-by-step solution for each question)"
          className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        />

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Example Instructions</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setInstruction(ex)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium rounded-lg transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <Info size={16} /> How Bulk AI Edit Works
          </div>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
            <li>AI processes all questions in parallel batches for faster completion</li>
            <li>Your instruction is applied to each question individually</li>
            <li>Edits include question text, options, and solution based on your instruction</li>
            <li>Questions are updated automatically after processing</li>
            <li>Estimated time: 15–30 seconds (20 questions at a time)</li>
          </ul>
        </div>

        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-xs font-bold">
          <AlertTriangle size={16} />
          Warning: This will modify all {selectedCount} selected questions. Make sure your instruction is correct. This action uses AI credits and changes are applied immediately.
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl">Cancel</button>
          <button 
            onClick={handleApply}
            disabled={isProcessing || !instruction}
            className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-secondary flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <><Loader2 className="animate-spin" size={16} /> Processing...</> : 'Apply Bulk Edit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAIEditModal;
