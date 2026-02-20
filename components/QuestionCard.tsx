
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { ImageIcon, FileText, Copy, Check } from 'lucide-react';

declare const katex: any;

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const [copied, setCopied] = useState(false);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const optionsRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const handleCopy = () => {
    const text = `Q${question.question_number}: ${question.question_text}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMath = (text: string, element: HTMLElement | null) => {
    if (!element || !window.hasOwnProperty('katex')) return;
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
    <div className="bg-white p-5 rounded-2xl border border-primary/5 soft-shadow hover:shadow-md transition-all duration-200 group flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-peach text-primary font-bold text-sm font-display">
            {question.question_number}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
              <FileText size={10} /> Page {question.page_number}
            </span>
          </div>
        </div>
        <button onClick={handleCopy} className="p-1.5 text-slate-300 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>

      <div className="mb-4 flex-grow">
        <p ref={questionRef} className="text-dark text-sm font-medium leading-normal whitespace-pre-wrap"></p>
      </div>

      {question.diagram_url && (
        <div className="mb-4 p-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
          <img 
            src={question.diagram_url} 
            alt={question.diagram_alt_text || "Question Diagram"} 
            title={question.diagram_alt_text}
            className="max-h-48 object-contain rounded-md" 
          />
          {question.diagram_alt_text && (
            <p className="mt-2 text-[10px] text-slate-400 italic text-center px-2">
              {question.diagram_alt_text}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {['A', 'B', 'C', 'D'].map((key, idx) => {
          const diagramUrl = (question.options as any)[`${key}_diagram_url`];
          return (
            <div key={key} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-primary/20 transition-all text-xs">
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary w-4">{key}</span>
                <span ref={el => optionsRefs.current[idx] = el} className="text-slate-600 flex-1"></span>
              </div>
              {diagramUrl && (
                <div className="mt-1 flex flex-col items-center bg-white p-2 rounded-lg border border-slate-100/50">
                  <img 
                    src={diagramUrl} 
                    alt={(question.options as any)[`${key}_diagram_alt_text`] || `Option ${key} Visual`} 
                    title={(question.options as any)[`${key}_diagram_alt_text`]}
                    className="max-h-32 object-contain rounded" 
                  />
                  {(question.options as any)[`${key}_diagram_alt_text`] && (
                    <p className="mt-1 text-[9px] text-slate-400 italic text-center">
                      {(question.options as any)[`${key}_diagram_alt_text`]}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
