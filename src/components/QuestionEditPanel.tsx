import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Maximize, Download, Printer, Save, Image as ImageIcon, Trash2, GripVertical,
  Bold, Italic, Underline, Strikethrough, Superscript, Subscript, List, ListOrdered, Table, Sigma,
  Loader2, Plus, ArrowLeft, ArrowRight, ChevronDown
} from 'lucide-react';
import { Question } from '../types';

interface QuestionEditPanelProps {
  question: Question;
  onClose: () => void;
  onSave: (updatedQuestion: Question) => void;
  pdfUrl?: string;
}

export const QuestionEditPanel: React.FC<QuestionEditPanelProps> = ({ question, onClose, onSave, pdfUrl }) => {
  const [editedQuestion, setEditedQuestion] = useState<Question>({ ...question });
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [subject, setSubject] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'very_hard' | ''>('');
  const [questionType, setQuestionType] = useState<string>('mcq_single');
  const [activeTab, setActiveTab] = useState<'ai' | 'pdf'>('pdf');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleChange = (field: keyof Question, value: any) => {
    setEditedQuestion(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleOptionChange = (key: string, value: string) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: { ...prev.options, [key]: value }
    }));
    setIsDirty(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'question' | 'A' | 'B' | 'C' | 'D') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (target === 'question') {
        handleChange('diagram_url', base64);
      } else {
        handleOptionChange(`${target}_diagram_url`, base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(editedQuestion);
      setIsSaving(false);
      setIsDirty(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-dark/60 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col w-full h-full max-w-7xl mx-auto bg-slate-50 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-6 bg-white border-b border-slate-100 shrink-0 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-dark flex items-center gap-2 font-display tracking-tight">
                Intelligence Refinement
                {isDirty && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Question Unit #{question.question_number}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
              <button 
                onClick={() => {
                  setStatus(s => s === 'draft' ? 'published' : 'draft');
                  setIsDirty(true);
                }}
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  status === 'draft' 
                    ? 'bg-amber-50 text-amber-600 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}
              >
                {status === 'draft' ? 'Draft' : 'Active'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={subject} 
                onChange={(e) => { setSubject(e.target.value); setIsDirty(true); }}
                className="text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl px-4 py-2 bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              >
                <option value="">Subject...</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="math">Mathematics</option>
                <option value="biology">Biology</option>
              </select>

              <select 
                value={difficulty} 
                onChange={(e) => { setDifficulty(e.target.value as any); setIsDirty(true); }}
                className="text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl px-4 py-2 bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              >
                <option value="">Difficulty...</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="very_hard">Very Hard</option>
              </select>
            </div>

            <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${
                  isDirty && !isSaving
                    ? 'bg-primary text-white hover:opacity-90 shadow-primary/20' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isSaving ? (
                  <><Loader2 className="animate-spin" size={16} /> Syncing...</>
                ) : (
                  <><Save size={16} /> Commit Changes</>
                )}
              </button>
              <button onClick={onClose} className="p-3 text-slate-400 hover:text-dark hover:bg-slate-100 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-8 bg-white border-b border-slate-100 shrink-0 gap-8">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.25em] border-b-2 transition-all ${
              activeTab === 'ai' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles size={16} /> Intelligence Assistant
          </button>
          <button 
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.25em] border-b-2 transition-all ${
              activeTab === 'pdf' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText size={16} /> Source Context (Page {question.page_number})
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Panel: Context/AI */}
          <div className="w-1/2 border-r border-slate-100 bg-slate-50/50 flex flex-col overflow-hidden">
            {activeTab === 'pdf' ? (
              <>
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ChevronLeft size={14} /> Source Material Fragment
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><ZoomOut size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><ZoomIn size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Maximize size={18} /></button>
                    <div className="w-px h-6 bg-slate-100 mx-1"></div>
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Download size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Printer size={18} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-8 flex items-center justify-center relative">
                  <div className="w-full max-w-lg aspect-[3/4] bg-white shadow-2xl rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
                      {pdfUrl ? "Initializing Source Viewer..." : "No Source Context Available"}
                    </div>
                    {/* Mock Highlight */}
                    <div className="absolute top-[25%] left-10 right-10 h-24 bg-primary/10 border-2 border-primary/30 rounded-2xl pointer-events-none animate-pulse"></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 flex flex-col h-full space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-sm font-black text-dark uppercase tracking-widest">Intelligence Assistant</h3>
                </div>
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  
                  <div className="flex-1 overflow-auto space-y-6 relative z-10">
                    <div className="bg-primary/5 text-primary p-6 rounded-[1.5rem] text-xs font-bold leading-relaxed border border-primary/10">
                      I am monitoring your edits. I can assist with rephrasing, logic verification, or multi-language translation. How shall we proceed?
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-50 relative z-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Rephrase', 'Fix Grammar', 'Translate', 'Detect Type'].map(action => (
                        <button key={action} className="px-4 py-2 bg-slate-50 hover:bg-primary hover:text-white text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-100">
                          {action}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Command Intelligence Engine..." 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all pr-12"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-xl transition-all">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Editor */}
          <div className="w-1/2 overflow-auto bg-white p-8 custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-8">
              
              <button className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group">
                <span className="group-hover:scale-110 inline-block transition-transform">+ Add Passage / Context</span>
              </button>

              {/* Question Text Editor */}
              <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Question Fragment (English)
                  </span>
                  <div className="flex items-center gap-1">
                    {[Bold, Italic, Underline, Sigma].map((Icon, idx) => (
                      <button key={idx} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Icon size={16} /></button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={editedQuestion.question_eng || editedQuestion.question_text}
                  onChange={(e) => {
                    handleChange('question_eng', e.target.value);
                    if (!editedQuestion.question_hin) handleChange('question_text', e.target.value);
                  }}
                  className="w-full p-8 min-h-[120px] text-sm font-bold text-dark bg-transparent focus:outline-none resize-y leading-relaxed"
                  placeholder="Initialize English question intelligence..."
                />
                
                <div className="px-8 py-4 bg-white border-y border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Question Fragment (Hindi)
                  </span>
                </div>
                <textarea
                  value={editedQuestion.question_hin || ''}
                  onChange={(e) => handleChange('question_hin', e.target.value)}
                  className="w-full p-8 min-h-[120px] text-sm font-bold text-dark bg-transparent focus:outline-none resize-y leading-relaxed"
                  placeholder="Initialize Hindi question intelligence..."
                />
                <div className="px-8 py-3 bg-white border-t border-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-300 text-right">
                  {editedQuestion.question_text.length} Units of Data
                </div>
              </div>

              {/* Diagram Editor */}
              {editedQuestion.diagram_url ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Visual Intelligence Asset</span>
                    <div className="flex gap-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 cursor-pointer transition-all">
                        Replace Asset
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, 'question')} 
                        />
                      </label>
                      <button 
                        onClick={() => handleChange('diagram_url', undefined)}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:opacity-70 transition-all"
                      >
                        Purge Asset
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-[2rem] p-8 flex justify-center border border-slate-100">
                    <img src={editedQuestion.diagram_url} alt="Question Diagram" className="max-h-48 object-contain rounded-2xl shadow-lg" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Asset Metadata / Alt Text..." 
                    value={editedQuestion.diagram_alt_text || ''}
                    onChange={(e) => handleChange('diagram_alt_text', e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              ) : (
                <label className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ImageIcon size={24} />
                  </div>
                  Attach Visual Intelligence
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'question')} 
                  />
                </label>
              )}

              {/* Options Editor */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
                  <span className="text-[10px] font-black text-dark uppercase tracking-[0.3em]">Response Matrix</span>
                </div>
                <div className="p-8 space-y-6">
                  {['A', 'B', 'C', 'D'].map((label) => (
                    <div key={label} className="flex items-start gap-4 group">
                      <div className="mt-4 text-slate-200 cursor-grab hover:text-primary transition-colors"><GripVertical size={18} /></div>
                      <div className="mt-4 font-black text-slate-400 w-8 text-sm">({label})</div>
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={(editedQuestion.options as any)[label] || ''}
                          onChange={(e) => handleOptionChange(label, e.target.value)}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-dark focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all resize-none min-h-[56px]"
                          rows={1}
                          placeholder={`Initialize Response ${label}...`}
                        />
                        {(editedQuestion.options as any)[`${label}_diagram_url`] ? (
                          <div className="relative inline-block group/img">
                            <img 
                              src={(editedQuestion.options as any)[`${label}_diagram_url`]} 
                              alt={`Option ${label}`} 
                              className="max-h-24 object-contain rounded-2xl border border-slate-100 shadow-md" 
                            />
                            <button 
                              onClick={() => handleOptionChange(`${label}_diagram_url`, undefined as any)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg opacity-0 group-hover/img:opacity-100 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="text-[9px] font-black uppercase tracking-widest text-primary hover:opacity-70 cursor-pointer flex items-center gap-2 w-max transition-all">
                            <ImageIcon size={14} /> Attach Visual
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, label as 'A' | 'B' | 'C' | 'D')} 
                            />
                          </label>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <label className="flex items-center gap-2 cursor-pointer group/radio">
                          <input 
                            type="radio" 
                            name="correct_answer" 
                            checked={editedQuestion.answer === label}
                            onChange={() => handleChange('answer', label)}
                            className="w-5 h-5 text-emerald-500 focus:ring-emerald-500/20 border-slate-200 transition-all"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/radio:text-emerald-600 transition-colors">Target</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 mt-4 ml-12 transition-all flex items-center gap-2">
                    <Plus size={14} /> Expand Matrix
                  </button>
                </div>
              </div>

              {/* Solution Editor */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full px-8 py-6 bg-slate-50/50 flex items-center justify-between hover:bg-slate-100 transition-all group"
                >
                  <span className="text-[10px] font-black text-dark uppercase tracking-[0.3em]">Logic & Explanation Protocol</span>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform duration-500 ${showExplanation ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-8 border-t border-slate-100 space-y-8"
                    >
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Logic Fragment (English)</label>
                        <textarea
                          value={editedQuestion.solution_eng || ''}
                          onChange={(e) => handleChange('solution_eng', e.target.value)}
                          className="w-full p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-sm font-bold text-dark focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[120px] leading-relaxed"
                          placeholder="Initialize English logic sequence..."
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Logic Fragment (Hindi)</label>
                        <textarea
                          value={editedQuestion.solution_hin || ''}
                          onChange={(e) => handleChange('solution_hin', e.target.value)}
                          className="w-full p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-sm font-bold text-dark focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[120px] leading-relaxed"
                          placeholder="Initialize Hindi logic sequence..."
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-8 py-4 bg-white border-t border-slate-100 shrink-0">
          <button className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-dark hover:bg-slate-50 rounded-2xl transition-all group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Previous Unit
          </button>
          <div className="px-6 py-2 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            Intelligence Unit <span className="text-primary">{question.question_number}</span> of 20
          </div>
          <button className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-dark hover:bg-slate-50 rounded-2xl transition-all group">
            Next Unit <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
