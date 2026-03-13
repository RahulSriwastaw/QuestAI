import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateCurrentAffairsQuestions } from '../services/geminiService';
import { Question } from '../types';
import { Calendar, Loader2, Save, Globe, BookOpen } from 'lucide-react';

interface CurrentAffairsGeneratorProps {
  onQuestionsGenerated: (questions: Question[], topic: string, date: string) => void;
}

export default function CurrentAffairsGenerator({ onQuestionsGenerated }: CurrentAffairsGeneratorProps) {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Monthly' | 'Yearly'>('Daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState('English');
  const [isBilingual, setIsBilingual] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      let targetDate = date;
      if (timeframe === 'Monthly') targetDate = month;
      if (timeframe === 'Yearly') targetDate = year;

      const generated = await generateCurrentAffairsQuestions(targetDate, topic, count, language, isBilingual);
      
      // Map to Question type
      const formattedQuestions: Question[] = generated.map((q: any) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        question_number: q.question_number,
        question_text: isBilingual ? `${q.question_eng} / ${q.question_hin}` : q.question_text,
        question_eng: q.question_eng,
        question_hin: q.question_hin,
        options: q.options,
        answer: q.answer,
        solution_hin: q.solution_hin,
        solution_eng: q.solution_eng,
        has_diagram: false,
        page_number: 1,
        tags: ['Current Affairs', date]
      }));

      onQuestionsGenerated(formattedQuestions, topic, date);
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto p-4 space-y-6"
    >
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-dark">Current Affairs Generator</h2>
            <p className="text-slate-500 text-[10px] mt-0.5">Generate daily current affairs questions using AI</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Timeframe</label>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">
                {timeframe === 'Daily' ? 'Select Date' : timeframe === 'Monthly' ? 'Select Month' : 'Select Year'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                {timeframe === 'Daily' && (
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                )}
                {timeframe === 'Monthly' && (
                  <input 
                    type="month" 
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                )}
                {timeframe === 'Yearly' && (
                  <input 
                    type="number" 
                    min="2000"
                    max="2100"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Language</label>
              <div className="flex items-center gap-4">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isBilingual}
                    onChange={(e) => setIsBilingual(e.target.checked)}
                    className="accent-primary"
                  />
                  Bilingual
                </label>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Specific Topic (Optional)</label>
              <div className="relative">
                <BookOpen className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Sports, Union Budget..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Number of Questions</label>
            <input 
              type="range" 
              min="5" 
              max="50" 
              step="5"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5"
            />
            <div className="text-right text-xs font-bold text-primary">{count} Questions</div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Questions'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
