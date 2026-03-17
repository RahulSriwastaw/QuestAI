import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionSet, BankQuestion, Question } from '../types';
import { Trash2, Download, Lock, Key, ChevronDown, FileText, FileJson, FileCode, X, LayoutGrid, ArrowLeft, ArrowRight } from 'lucide-react';
import QuestionCard from './QuestionCard';
import { QuestionEditPanel } from './QuestionEditPanel';
import { useNavigate } from 'react-router-dom';

interface SetsViewProps {
  sets: QuestionSet[];
  bankQuestions: BankQuestion[];
  onDeleteSet: (id: string) => void;
  onExportPDF: (questions: Question[]) => void;
  onExportWord: (questions: Question[]) => void;
  onExportJSON: (customFields?: string[], questions?: Question[]) => void;
  onExportTXT: (questions: Question[]) => void;
  onExportCSV: (questions: Question[]) => void;
  onUpdateQuestion?: (question: Question) => void;
}

const SetsView: React.FC<SetsViewProps> = ({
  sets,
  bankQuestions,
  onDeleteSet,
  onExportPDF,
  onExportWord,
  onExportJSON,
  onExportTXT,
  onExportCSV,
  onUpdateQuestion
}) => {
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [unlockedSets, setUnlockedSets] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSetClick = (set: QuestionSet) => {
    setError(null);
    if (set.password && !unlockedSets.has(set.id)) {
      setSelectedSet(set);
    } else {
      setSelectedSet(set);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSet && selectedSet.password === passwordInput) {
      setUnlockedSets(new Set(unlockedSets).add(selectedSet.id));
      setPasswordInput('');
      setError(null);
    } else {
      setError('Incorrect password');
    }
  };

  if (selectedSet && (!selectedSet.password || unlockedSets.has(selectedSet.id))) {
    const setQuestions = bankQuestions.filter(q => selectedSet.questionIds.includes(q.id));
    
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setSelectedSet(null)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-dark font-display tracking-tight leading-tight">{selectedSet.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-md tracking-widest">Question Set</span>
                  <span className="text-xs text-slate-400 font-medium">{setQuestions.length} items curated</span>
                </div>
              </div>
            </div>
            
            <div className="relative" ref={exportMenuRef}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-8 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-secondary shadow-2xl shadow-primary/20 transition-all flex items-center gap-3"
              >
                <Download size={16} /> Export Set <ChevronDown size={14} className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.12)] overflow-hidden z-50"
                  >
                    <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Export Configuration</h4>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {[
                        { id: 'editor', icon: <LayoutGrid size={18} />, color: 'purple', label: 'Design Editor', desc: 'Open in high-fidelity editor', action: () => navigate('/editor') },
                        { id: 'pdf', icon: <FileText size={18} />, color: 'red', label: 'PDF Document', desc: 'Professional print-ready layout', action: () => onExportPDF(setQuestions) },
                        { id: 'word', icon: <FileText size={18} />, color: 'blue', label: 'Word Document', desc: 'Fully editable DOCX format', action: () => onExportWord(setQuestions) },
                        { id: 'json', icon: <FileJson size={18} />, color: 'emerald', label: 'JSON Data', desc: 'Raw structured intelligence', action: () => onExportJSON(undefined, setQuestions) },
                        { id: 'txt', icon: <FileCode size={18} />, color: 'slate', label: 'Text Report', desc: 'Clean plain text summary', action: () => onExportTXT(setQuestions) },
                        { id: 'csv', icon: <FileCode size={18} />, color: 'amber', label: 'CSV Data', desc: 'Structured spreadsheet format', action: () => onExportCSV(setQuestions) }
                      ].map((opt) => (
                        <button 
                          key={opt.id}
                          onClick={() => { opt.action(); setShowExportMenu(false); }} 
                          className="w-full flex items-start gap-4 p-3.5 rounded-2xl hover:bg-slate-50 transition-all group text-left"
                        >
                          <div className={`p-2.5 bg-${opt.color}-50 text-${opt.color}-500 rounded-xl group-hover:scale-110 transition-transform`}>
                            {opt.icon}
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-700 uppercase tracking-wider">{opt.label}</div>
                            <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{opt.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {setQuestions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <QuestionCard 
                    question={q} 
                    viewMode="list"
                    onEdit={setEditingQuestion}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {setQuestions.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 animate-pulse">
                  <FileText size={40} />
                </div>
                <h3 className="text-2xl font-black text-dark font-display mb-2">No Questions Found</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">This set is currently empty. Add questions from the bank to begin.</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Edit Question Panel */}
        {editingQuestion && (
          <QuestionEditPanel
            question={editingQuestion}
            onClose={() => setEditingQuestion(null)}
            onSave={(updatedQuestion) => {
              if (onUpdateQuestion) {
                onUpdateQuestion(updatedQuestion);
              }
              setEditingQuestion(null);
            }}
          />
        )}
      </div>
    );
  }

  const safeSets = sets || [];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
      <div className="max-w-7xl mx-auto w-full px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-dark font-display tracking-tight leading-tight">Question Intelligence Sets</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Manage and deploy your curated assessment collections.</p>
          </div>
          <div className="px-6 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
            {safeSets.length} Active Sets
          </div>
        </div>

        {safeSets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-300 animate-float">
              <Lock size={48} />
            </div>
            <h3 className="text-2xl font-black text-dark font-display mb-3">No Sets Detected</h3>
            <p className="text-sm text-slate-400 font-medium max-w-md mx-auto leading-relaxed">Your intelligence repository is currently empty. Curate questions from the bank to initialize your first set.</p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {safeSets.map(set => (
                <motion.div 
                  key={set.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleSetClick(set)}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden group cursor-pointer relative"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                        set.password ? 'bg-amber-50 text-amber-500' : 'bg-primary/10 text-primary'
                      }`}>
                        {set.password ? <Lock size={24} /> : <FileText size={24} />}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteSet(set.id); }}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <h3 className="text-lg font-black text-dark mb-2 group-hover:text-primary transition-colors truncate">{set.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md">ID: {set.id.slice(0, 8)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-primary">{set.questionIds.length} Questions</span>
                    </div>
                  </div>
                  
                  {selectedSet?.id === set.id && set.password && !unlockedSets.has(set.id) ? (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      onClick={(e) => e.stopPropagation()}
                      onSubmit={handleUnlock} 
                      className="px-8 pb-8 pt-4 border-t border-slate-50 bg-slate-50/50"
                    >
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Access Key Required</label>
                      <div className="flex gap-3">
                        <input 
                          type="password" 
                          value={passwordInput}
                          onChange={e => setPasswordInput(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                          placeholder="Enter Key..."
                          autoFocus
                        />
                        <button type="submit" className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all active:scale-95">
                          <Key size={18} />
                        </button>
                      </div>
                      {error && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mt-2 ml-1">{error}</p>}
                    </motion.form>
                  ) : (
                    <div className="px-8 pb-8 pt-4 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary group-hover:translate-x-1 transition-transform flex items-center gap-2">
                        Initialize Access <ArrowRight size={14} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SetsView;
