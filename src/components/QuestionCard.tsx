
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { Copy, Check, Edit2, Trash2, FileText, Layout, MoreVertical, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

declare const katex: any;

interface QuestionCardProps {
  question: Question;
  selected?: boolean;
  viewMode?: 'grid' | 'list' | 'table';
  onSelect?: (id: string) => void;
  onEdit?: (question: Question) => void;
  onDelete?: () => void;
  onToggleStatus?: (status: 'active' | 'draft') => void;
  onToggleRefinement?: (status: 'pending' | 'final') => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selected, viewMode = 'grid', onSelect, onEdit, onDelete, onToggleStatus, onToggleRefinement }) => {
  const [isActive, setIsActive] = useState(question.status !== 'draft');
  const [isFinal, setIsFinal] = useState(question.refinementStatus === 'final');
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const solutionEngRef = useRef<HTMLDivElement>(null);
  const solutionHinRef = useRef<HTMLDivElement>(null);
  
  const toggleRefinement = () => {
    const newStatus = isFinal ? 'pending' : 'final';
    setIsFinal(!isFinal);
    if (onToggleRefinement) {
      onToggleRefinement(newStatus);
    }
  };
  const optionsRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const toggleStatus = () => {
    const newStatus = isActive ? 'draft' : 'active';
    setIsActive(!isActive);
    if (onToggleStatus) {
      onToggleStatus(newStatus);
    }
  };

  const handleCopy = () => {
    const text = `Q${question.question_number}: ${question.question_text}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMath = (text: string | undefined, element: HTMLElement | null) => {
    if (!element || !window.hasOwnProperty('katex') || !text) {
      if (element && text) element.textContent = text;
      return;
    }
    const parts = text.split(/(\$.*?\$)/g);
    element.innerHTML = '';
    parts.forEach(part => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        const span = document.createElement('span');
        try {
          katex.render(math, span, { throwOnError: false, displayMode: false, strict: false });
          element.appendChild(span);
        } catch (e) {
          element.appendChild(document.createTextNode(part));
        }
      } else {
        element.appendChild(document.createTextNode(part));
      }
    });
  };

  useEffect(() => {
    renderMath(question.question_text, questionRef.current);
    ['A', 'B', 'C', 'D'].forEach((label, idx) => {
      const val = question.options[label as keyof typeof question.options] as string;
      renderMath(val, optionsRefs.current[idx]);
    });
    if (showSolution) {
      renderMath(question.solution_eng, solutionEngRef.current);
      renderMath(question.solution_hin, solutionHinRef.current);
    }
  }, [question, showSolution]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative bg-white rounded-3xl border transition-all duration-500 flex ${viewMode === 'list' ? 'flex-col md:flex-row' : 'flex-col'} h-full overflow-hidden ${
        selected 
          ? 'border-primary ring-4 ring-primary/10 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.15)]' 
          : 'border-slate-100 hover:border-primary/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]'
      }`}
    >
      {/* Selection Overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1 border-r border-slate-50' : 'w-full'}`}>
        {/* Header Section */}
        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            {onSelect && (
              <button 
                onClick={() => onSelect(question.id)}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  selected ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/20' : 'border-slate-200 hover:border-primary/50'
                }`}
              >
                {selected && <Check size={10} className="text-white stroke-[4]" />}
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs transition-all duration-500 ${
                selected ? 'bg-primary text-white rotate-6 shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white group-hover:-rotate-6'
              }`}>
                {question.question_number}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                  Intelligence
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-black uppercase tracking-widest leading-none ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {isActive ? 'Active' : 'Draft'}
                  </span>
                  <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div 
              className={`w-8 h-4.5 rounded-full relative cursor-pointer transition-all duration-500 ${isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200'}`} 
              onClick={toggleStatus}
            >
              <motion.div 
                animate={{ x: isActive ? 16 : 2 }}
                className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-md"
              />
            </div>
            <button className="p-1.5 text-slate-400 hover:text-dark rounded-xl hover:bg-slate-100 transition-all">
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        {/* Question Area */}
        <div className="p-5 flex-grow space-y-4 z-10">
          <div className="text-dark text-[13px] font-bold leading-relaxed tracking-tight">
            <p ref={questionRef} className="whitespace-pre-wrap"></p>
          </div>
          
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 gap-2">
              {['A', 'B', 'C', 'D'].map((key, idx) => (
                <div 
                  key={key} 
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 ${
                    question.answer === key 
                      ? 'bg-emerald-50/50 border-emerald-200/50 shadow-sm' 
                      : 'bg-slate-50/30 border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-300 ${
                    question.answer === key 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'bg-white text-slate-400 border border-slate-100'
                  }`}>
                    {key}
                  </div>
                  <span ref={el => { optionsRefs.current[idx] = el; }} className={`text-[11px] font-semibold flex-1 ${
                    question.answer === key ? 'text-emerald-900' : 'text-slate-600'
                  }`}></span>
                  {question.answer === key && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check size={12} className="text-emerald-500 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {showSolution && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: 10 }}
                className="mt-4 pt-4 border-t border-slate-100 space-y-3"
              >
                {question.solution_eng && (
                  <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">English Insight</span>
                    </div>
                    <div ref={solutionEngRef} className="text-[10px] text-slate-600 leading-relaxed font-medium italic"></div>
                  </div>
                )}
                {question.solution_hin && (
                  <div className="bg-accent-3/5 p-3 rounded-2xl border border-accent-3/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-3" />
                      <span className="text-[9px] font-black text-accent-3 uppercase tracking-[0.2em]">Hindi Insight</span>
                    </div>
                    <div ref={solutionHinRef} className="text-[10px] text-slate-600 leading-relaxed font-medium italic"></div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Options Section for List View */}
      {viewMode === 'list' && (
        <div className="w-full md:w-2/5 p-4 bg-slate-50/20 flex flex-col justify-center z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['A', 'B', 'C', 'D'].map((key, idx) => (
              <div 
                key={key} 
                className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 ${
                  question.answer === key 
                    ? 'bg-emerald-50/50 border-emerald-200/50 shadow-sm' 
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${
                  question.answer === key 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {key}
                </div>
                <span ref={el => { optionsRefs.current[idx] = el; }} className={`text-[10px] font-semibold flex-1 truncate ${
                  question.answer === key ? 'text-emerald-900' : 'text-slate-600'
                }`}></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className={`px-4 py-3 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between z-10 ${viewMode === 'list' ? 'md:w-auto md:border-t-0 md:border-l md:flex-col md:justify-center md:gap-3' : ''}`}>
        <div className={`flex items-center gap-2 ${viewMode === 'list' ? 'md:flex-col' : ''}`}>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
            <FileText size={10} className="text-primary" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Pg {question.page_number || 1}
            </span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
            <Layout size={10} className="text-primary" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              MCQ
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-1 ${viewMode === 'list' ? 'md:flex-col' : ''}`}>
          <button 
            onClick={() => setShowSolution(!showSolution)}
            title="View Solution"
            className={`p-2 rounded-xl transition-all duration-300 ${
              showSolution 
                ? 'text-accent-2 bg-accent-2/10 shadow-lg shadow-accent-2/10 scale-110' 
                : 'text-slate-400 hover:text-accent-2 hover:bg-accent-2/5'
            }`}
          >
            <Sparkles size={16} className={showSolution ? 'stroke-[3]' : ''} />
          </button>
          <button 
            onClick={toggleRefinement}
            title="Mark as Final"
            className={`p-2 rounded-xl transition-all duration-300 ${
              isFinal 
                ? 'text-emerald-600 bg-emerald-100 shadow-lg shadow-emerald-500/10 scale-110' 
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Check size={16} className={isFinal ? 'stroke-[3]' : ''} />
          </button>
          <button 
            onClick={() => onEdit && onEdit(question)}
            title="Edit Question"
            className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all hover:scale-110"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete && onDelete()}
            title="Delete Question"
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all hover:scale-110"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;

