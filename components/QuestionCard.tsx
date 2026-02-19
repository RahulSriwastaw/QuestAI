
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
    <div className="bg-white p-4 rounded-2xl border border-primary/5 soft-shadow hover:shadow-md transition-all duration-200 group flex flex-col h-full compact-card">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-peach text-primary font-bold text-xs font-display">
            {question.question_number}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1 leading-none pt-[1px]">
              <FileText size={10} className="flex-shrink-0" /> Page {question.page_number}
            </span>
          </div>
        </div>
        <button onClick={handleCopy} className="p-1 text-slate-300 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
        </button>
      </div>

      <div className="mb-3 flex-grow">
        <p ref={questionRef} className="text-dark text-[13px] font-medium leading-relaxed whitespace-pre-wrap selection:bg-peach/30"></p>
      </div>

      {question.diagram_url && (
        <div className="mb-3 p-1.5 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col items-center">
          <img
            src={question.diagram_url}
            alt={question.diagram_alt_text || "Question Diagram"}
            title={question.diagram_alt_text}
            className="max-h-40 object-contain rounded-md"
          />
          {question.diagram_alt_text && (
            <p className="mt-1 text-[9px] text-slate-400 italic text-center px-2 line-clamp-1">
              {question.diagram_alt_text}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-1.5">
        {['A', 'B', 'C', 'D'].map((key, idx) => {
          const diagramUrl = (question.options as any)[`${key}_diagram_url`];
          return (
            <div key={key} className="flex flex-col gap-1.5 p-2 rounded-lg border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-primary/20 transition-all text-xs group/opt">
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary/70 group-hover/opt:text-primary w-3 mt-0.5">{key}</span>
                <span ref={el => optionsRefs.current[idx] = el} className="text-slate-600 flex-1 leading-snug"></span>
              </div>
              {diagramUrl && (
                <div className="mt-1 flex flex-col items-center bg-white p-1 rounded border border-slate-100/50">
                  <img
                    src={diagramUrl}
                    alt={(question.options as any)[`${key}_diagram_alt_text`] || `Option ${key} Visual`}
                    title={(question.options as any)[`${key}_diagram_alt_text`]}
                    className="max-h-24 object-contain rounded"
                  />
                  {(question.options as any)[`${key}_diagram_alt_text`] && (
                    <p className="mt-0.5 text-[8px] text-slate-300 italic text-center">
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
