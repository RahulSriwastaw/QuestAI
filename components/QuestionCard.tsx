
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { Copy, Check, Edit2, Trash2 } from 'lucide-react';

declare const katex: any;

interface QuestionCardProps {
  question: Question;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (question: Question) => void;
  onDelete?: () => void;
  onToggleStatus?: (status: 'active' | 'draft') => void;
  onToggleRefinement?: (status: 'pending' | 'final') => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selected, onSelect, onEdit, onDelete, onToggleStatus, onToggleRefinement }) => {
  const [isActive, setIsActive] = useState(question.status !== 'draft');
  const [isFinal, setIsFinal] = useState(question.refinementStatus === 'final');
  const [copied, setCopied] = useState(false);
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
          katex.render(math, span, { throwOnError: false, displayMode: false });
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
    <div className={`bg-white rounded-xl border ${selected ? 'border-primary shadow-md' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden`}>
      {/* Header Section */}
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          {onSelect && (
            <input 
              type="checkbox" 
              checked={selected || false}
              onChange={() => onSelect(question.id)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" 
            />
          )}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-[10px]">
            {question.question_number}
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {isActive ? 'Active' : 'Draft'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={toggleStatus}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'left-4.5' : 'left-0.5'}`}></div>
          </button>
        </div>
      </div>

      {/* Question Area */}
      <div className="p-4 flex-grow space-y-2">
        <div className="text-slate-800 text-xs font-medium leading-snug line-clamp-3">
          <p ref={questionRef} className="whitespace-pre-wrap"></p>
        </div>

        {/* Options Section */}
        <div className="space-y-1">
          <div className="grid grid-cols-1 gap-1">
            {['A', 'B', 'C', 'D'].map((key, idx) => (
              <div key={key} className="flex items-start gap-1.5 text-[11px]">
                <span className="font-bold text-slate-400 w-3">{key}.</span>
                <span ref={el => { optionsRefs.current[idx] = el; }} className="text-slate-600 flex-1"></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-3 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          MCQ • P{question.page_number || 1}
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleRefinement}
            className={`p-1.5 rounded-lg transition-all ${isFinal ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
          >
            <Check size={13} />
          </button>
          <button 
            onClick={() => onEdit && onEdit(question)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
          >
            <Edit2 size={13} />
          </button>
          <button 
            onClick={() => onDelete && onDelete()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
