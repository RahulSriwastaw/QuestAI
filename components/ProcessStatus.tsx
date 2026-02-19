
import React from 'react';
import { ProcessStep } from '../types';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProcessStatusProps {
  step: ProcessStep;
  progress: number;
  message: string;
}

const ProcessStatus: React.FC<ProcessStatusProps> = ({ step, progress, message }) => {
  if (step === ProcessStep.IDLE) return null;

  const isError = step === ProcessStep.ERROR;
  const isCompleted = step === ProcessStep.COMPLETED;

  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-white rounded-2xl soft-shadow border border-primary/5 mb-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isCompleted ? 'bg-green-100 text-green-500' : isError ? 'bg-red-100 text-red-500' : 'bg-peach text-primary'}`}>
            {isCompleted ? (
              <CheckCircle2 size={18} />
            ) : isError ? (
              <AlertCircle size={18} />
            ) : (
              <Loader2 size={18} className="animate-spin" />
            )}
          </div>
          <div>
            <span className="font-bold text-dark block text-sm">{message}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{step.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-black text-primary font-display">{Math.round(progress)}%</span>
        </div>
      </div>
      
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${isError ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-primary'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProcessStatus;
