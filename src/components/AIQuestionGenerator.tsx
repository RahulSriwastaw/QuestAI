import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateAIQuestions } from '../services/geminiService';
import { Question } from '../types';
import { Calendar, Loader2, Globe, BookOpen, Sparkles } from 'lucide-react';

interface AIQuestionGeneratorProps {
  onQuestionsGenerated: (questions: Question[], topic: string, date: string) => void;
}

export default function AIQuestionGenerator({ onQuestionsGenerated }: AIQuestionGeneratorProps) {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Monthly' | 'Yearly' | 'General'>('Daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Bilingual'>('English');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      let targetDate = date;
      if (timeframe === 'Monthly') targetDate = month;
      if (timeframe === 'Yearly') targetDate = year;
      if (timeframe === 'General') targetDate = 'General Knowledge';

      const generated = await generateAIQuestions(
        targetDate, 
        topic, 
        count, 
        language === 'Bilingual' ? 'English and Hindi' : language, 
        language === 'Bilingual'
      );
      
      // Map to Question type
      const formattedQuestions: Question[] = generated.map((q: any) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        question_number: q.question_number,
        question_text: language === 'Bilingual' ? `${q.question_eng} / ${q.question_hin}` : q.question_text,
        question_eng: q.question_eng,
        question_hin: q.question_hin,
        options: q.options,
        answer: q.answer,
        solution_hin: q.solution_hin,
        solution_eng: q.solution_eng,
        has_diagram: false,
        page_number: 1,
        tags: ['AI Generated', timeframe === 'General' ? 'General' : date, topic].filter(Boolean) as string[]
      }));

      onQuestionsGenerated(formattedQuestions, topic || 'AI Generated', targetDate);
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-100 p-10 shadow-[0_30px_100px_rgba(0,0,0,0.08)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
        
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 group-hover:rotate-6 transition-transform duration-500">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-dark font-display tracking-tight">AI Intelligence Engine</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Harness advanced neural models to synthesize high-fidelity assessment items.</p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contextual Framework</label>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_20px_center] bg-no-repeat"
              >
                <option value="Daily">Daily Contextual Analysis</option>
                <option value="Monthly">Monthly Strategic Review</option>
                <option value="Yearly">Yearly Retrospective</option>
                <option value="General">Universal Knowledge Base</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                {timeframe === 'Daily' ? 'Target Chronology' : timeframe === 'Monthly' ? 'Target Period' : timeframe === 'Yearly' ? 'Target Era' : 'Framework Domain'}
              </label>
              <div className="relative group/input">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors" size={20} />
                {timeframe === 'Daily' && (
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  />
                )}
                {timeframe === 'Monthly' && (
                  <input 
                    type="month" 
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  />
                )}
                {timeframe === 'Yearly' && (
                  <input 
                    type="number" 
                    min="2000"
                    max="2100"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  />
                )}
                {timeframe === 'General' && (
                  <input 
                    type="text" 
                    disabled
                    value="Universal Intelligence"
                    className="w-full pl-14 pr-5 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Linguistic Configuration</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_20px_center] bg-no-repeat"
              >
                <option value="English">Standard English</option>
                <option value="Hindi">Standard Hindi</option>
                <option value="Bilingual">Bilingual Synthesis</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Knowledge Domain</label>
              <div className="relative group/input">
                <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors" size={20} />
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Quantum Mechanics, Global History..."
                  className="w-full pl-14 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-slate-50/30 p-8 rounded-[2rem] border border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Output Volume</label>
              <div className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">
                {count} Intelligence Units
              </div>
            </div>
            <input 
              type="range" 
              min="5" 
              max="50" 
              step="5"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-primary h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
              <span>Minimal (5)</span>
              <span>Optimal (25)</span>
              <span>Maximum (50)</span>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-6 bg-primary text-white text-xs font-black uppercase tracking-[0.3em] rounded-[2rem] hover:opacity-90 shadow-2xl shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group/btn overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Synthesizing Data...
              </>
            ) : (
              <>
                <Sparkles size={20} className="group-hover/btn:scale-125 transition-transform" />
                Initialize Generation
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
