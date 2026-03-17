import React, { useState } from 'react';
import { X, Loader2, AlertTriangle, Info, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] w-full max-w-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-primary/5">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight font-display">Bulk Intelligence Engine</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">AI-Powered Refinement for {selectedCount} items</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Refinement Instruction</label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Describe how you want to refine these questions... (e.g., 'Add a detailed step-by-step solution and translate to Hindi')"
              className="w-full h-40 p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all font-bold text-sm placeholder:text-slate-300 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Pre-configured Intelligence Templates</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInstruction(ex)}
                  className="px-4 py-2 bg-white hover:bg-primary hover:text-white text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/50 p-6 rounded-[2rem] space-y-4 border border-slate-100">
              <div className="flex items-center gap-2 text-dark font-black text-[10px] uppercase tracking-[0.2em]">
                <Info size={16} className="text-primary" /> Intelligence Protocol
              </div>
              <ul className="text-[10px] text-slate-500 space-y-2.5 font-bold leading-relaxed">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Parallel batch processing for high-velocity refinement
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Granular application of instructions to each data point
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Comprehensive updates across text, options, and logic
                </li>
              </ul>
            </div>

            <div className="flex flex-col justify-center items-center gap-3 text-amber-600 bg-amber-50/50 p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-wider leading-relaxed border border-amber-100 text-center">
              <AlertTriangle size={24} className="mb-1" />
              <p>Warning: Irreversible operation. This will modify {selectedCount} questions using AI tokens.</p>
            </div>
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
            disabled={isProcessing || !instruction}
            className="flex-[2] px-8 py-5 bg-primary text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:opacity-90 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            {isProcessing ? (
              <><Loader2 className="animate-spin" size={18} /> Initializing Engine...</>
            ) : (
              <><Sparkles size={18} /> Execute Bulk Refinement</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAIEditModal;
