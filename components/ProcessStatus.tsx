
import React, { useState } from 'react';
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
    <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="p-8 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Loader2 size={24} className="animate-spin" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-dark font-display">Processing PDF</h3>
              <p className="text-sm text-slate-400 font-medium">{fileName || 'Document'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
              <Maximize2 size={20} />
            </button>
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-slate-50 rounded-xl text-red-500 transition-colors"
              title="Cancel Process"
            >
              <StopCircle size={20} />
            </button>
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Phase Info */}
        <div className="px-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-dark">
            <Search size={18} className="text-purple-500" />
            {message}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-500">
              <Clock size={14} /> 0:07
            </div>
            <span className="text-lg font-black text-slate-400 font-display">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mb-8">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out rounded-full ${isError ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-[#FF4D00]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Recent Updates Section */}
        <div className="px-8 pb-8">
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-xs font-black text-dark uppercase tracking-widest">Recent Updates</h4>
              <button 
                onClick={() => setShowRawLog(!showRawLog)}
                className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors"
              >
                Show raw log
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 size={16} className="text-slate-400 animate-spin" />
                  <Search size={16} className="text-purple-500" />
                  <span className="text-xs font-bold text-slate-500">{message}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400">16:38:37</span>
              </div>
              {progress > 50 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-500">Phase 1: Analysis Complete</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">16:38:30</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessStatus;
