
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessStep } from '../types';
import { Loader2, CheckCircle2, AlertCircle, X, Maximize2, StopCircle, Search, Clock } from 'lucide-react';

interface ProcessStatusProps {
  step: ProcessStep;
  progress: number;
  message: string;
  fileName?: string;
  onCancel?: () => void;
}

const ProcessStatus: React.FC<ProcessStatusProps> = ({ step, progress, message, fileName, onCancel }) => {
  const [showRawLog, setShowRawLog] = useState(false);

  if (step === ProcessStep.IDLE || step === ProcessStep.SELECTING_PAGES) return null;

  const isError = step === ProcessStep.ERROR;
  const isCompleted = step === ProcessStep.COMPLETED;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
        >
        {/* Modal Header */}
        <div className="p-6 flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Loader2 size={20} className="animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-black text-dark font-display">Processing PDF</h3>
              <p className="text-xs text-slate-400 font-medium">{fileName || 'Document'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <Maximize2 size={16} />
            </button>
            <button 
              onClick={onCancel}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-red-500 transition-colors"
              title="Cancel Process"
            >
              <StopCircle size={16} />
            </button>
            <button 
              onClick={onCancel}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Phase Info */}
        <div className="px-6 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-dark">
            <Search size={14} className="text-purple-500" />
            {message}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-md text-[9px] font-bold text-slate-500">
              <Clock size={12} /> 0:07
            </div>
            <span className="text-base font-black text-slate-400 font-display">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 mb-6">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out rounded-full ${isError ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-[#FF4D00]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Recent Updates Section */}
        <div className="px-6 pb-6">
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-[9px] font-black text-dark uppercase tracking-widest">Recent Updates</h4>
              <button 
                onClick={() => setShowRawLog(!showRawLog)}
                className="text-[9px] font-bold text-slate-400 hover:text-primary transition-colors"
              >
                Show raw log
              </button>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Loader2 size={14} className="text-slate-400 animate-spin" />
                  <Search size={14} className="text-purple-500" />
                  <span className="text-[10px] font-bold text-slate-500">{message}</span>
                </div>
                <span className="text-[9px] font-medium text-slate-400">16:38:37</span>
              </div>
              {progress > 50 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500">Phase 1: Analysis Complete</span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-400">16:38:30</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
  );
};

export default ProcessStatus;
