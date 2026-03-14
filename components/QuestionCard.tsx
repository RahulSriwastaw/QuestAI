
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { Copy, Check, Edit2, Trash2, FileText, Layout, MoreVertical } from 'lucide-react';
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
  const questionRef = useRef<HTMLParagraphElement>(null);
  
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
  }, [question]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative bg-white rounded-xl border transition-all duration-300 flex ${viewMode === 'list' ? 'flex-col md:flex-row' : 'flex-col'} h-full overflow-hidden ${
        selected 
          ? 'border-primary ring-1 ring-primary/10 shadow-md shadow-primary/5' 
          : 'border-slate-200 hover:border-primary/30 hover:shadow-md hover:shadow-slate-200/50'
      }`}
    >
      {/* Selection Overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/5 pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1 border-r border-slate-100' : 'w-full'}`}>
        {/* Header Section */}
        <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-1.5">
            {onSelect && (
              <div 
                onClick={() => onSelect(question.id)}
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  selected ? 'bg-primary border-primary' : 'border-slate-300 hover:border-primary'
                }`}
              >
                {selected && <Check size={8} className="text-white stroke-[4]" />}
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className={`flex items-center justify-center w-4 h-4 rounded font-black text-[10px] transition-colors duration-200 ${
                selected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary'
              }`}>
                {question.question_number}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                  Q
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-wider leading-none ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {isActive ? 'A' : 'D'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className={`w-6 h-3.5 rounded-full relative cursor-pointer transition-all duration-300 ${isActive ? 'bg-emerald-500' : 'bg-slate-200'}`} 
              onClick={toggleStatus}
            >
              <motion.div 
                animate={{ x: isActive ? 10 : 2 }}
                className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm"
              />
            </button>
            <button className="p-0.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors">
              <MoreVertical size={12} />
            </button>
          </div>
        </div>

        {/* Question Area */}
        <div className="p-2 flex-grow space-y-2 z-10">
          <div className="text-slate-800 text-[11px] font-semibold leading-relaxed">
            <p ref={questionRef} className="whitespace-pre-wrap"></p>
          </div>
          
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 gap-1">
              {['A', 'B', 'C', 'D'].map((key, idx) => (
                <div 
                  key={key} 
                  className={`flex items-center gap-1.5 p-1 rounded-md border transition-all duration-200 ${
                    question.answer === key 
                      ? 'bg-emerald-50 border-emerald-100' 
                      : 'bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                    question.answer === key 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}>
                    {key}
                  </div>
                  <span ref={el => { optionsRefs.current[idx] = el; }} className={`text-[10px] font-medium flex-1 ${
                    question.answer === key ? 'text-emerald-900' : 'text-slate-600'
                  }`}></span>
                  {question.answer === key && (
                    <Check size={10} className="text-emerald-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Options Section for List View */}
      {viewMode === 'list' && (
        <div className="w-full md:w-2/5 p-2 bg-slate-50/30 flex flex-col justify-center z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {['A', 'B', 'C', 'D'].map((key, idx) => (
              <div 
                key={key} 
                className={`flex items-center gap-1.5 p-1 rounded-md border transition-all duration-200 ${
                  question.answer === key 
                    ? 'bg-emerald-50 border-emerald-100' 
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                  question.answer === key 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {key}
                </div>
                <span ref={el => { optionsRefs.current[idx] = el; }} className={`text-[9px] font-medium flex-1 truncate ${
                  question.answer === key ? 'text-emerald-900' : 'text-slate-600'
                }`}></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className={`px-2 py-1.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between z-10 ${viewMode === 'list' ? 'md:w-auto md:border-t-0 md:border-l md:flex-col md:justify-center md:gap-1.5' : ''}`}>
        <div className={`flex items-center gap-1.5 ${viewMode === 'list' ? 'md:flex-col' : ''}`}>
          <div className="flex items-center gap-1 px-1 py-0.5 bg-white rounded border border-slate-200 shadow-sm">
            <FileText size={8} className="text-slate-400" />
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">
              Pg {question.page_number || 1}
            </span>
          </div>
          <div className="flex items-center gap-1 px-1 py-0.5 bg-white rounded border border-slate-200 shadow-sm">
            <Layout size={8} className="text-slate-400" />
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">
              MCQ
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-0.5 ${viewMode === 'list' ? 'md:flex-col' : ''}`}>
          <button 
            onClick={toggleRefinement}
            title="Mark as Final"
            className={`p-1 rounded-md transition-all ${
              isFinal 
                ? 'text-emerald-600 bg-emerald-100 shadow-sm' 
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Check size={10} className={isFinal ? 'stroke-[3]' : ''} />
          </button>
          <button 
            onClick={() => onEdit && onEdit(question)}
            title="Edit Question"
            className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
          >
            <Edit2 size={10} />
          </button>
          <button 
            onClick={() => onDelete && onDelete()}
            title="Delete Question"
            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;

