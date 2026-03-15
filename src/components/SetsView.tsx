import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionSet, BankQuestion, Question } from '../types';
import { Trash2, Download, Lock, Key, ChevronDown, FileText, FileJson, FileCode, X, LayoutGrid } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

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
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto w-full px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button 
                onClick={() => setSelectedSet(null)}
                className="text-[9px] font-black uppercase text-slate-400 hover:text-primary transition-colors mb-1 flex items-center gap-1"
              >
                <X size={10} /> Back to Sets
              </button>
              <h1 className="text-xl font-black text-dark font-display">{selectedSet.name}</h1>
              <p className="text-[10px] text-slate-500 font-medium">ID: {selectedSet.id} • {setQuestions.length} questions</p>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase rounded-lg hover:bg-secondary shadow-sm shadow-primary/20 transition-all flex items-center gap-1.5"
              >
                <Download size={12} /> Export Set <ChevronDown size={10} />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-1 space-y-0.5">
                    <button onClick={() => navigate('/editor')} className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-left group">
                      <div className="w-6 h-6 rounded bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform"><LayoutGrid size={12} /></div>
                      <div>
                        <div className="text-[9px] font-black text-dark uppercase">Design Editor</div>
                        <div className="text-[8px] text-slate-400 font-medium">Open in Canva-like editor</div>
                      </div>
                    </button>
                    <button onClick={() => { onExportPDF(setQuestions); setShowExportMenu(false); }} className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-left group">
                      <div className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={12} /></div>
                      <div>
                        <div className="text-[9px] font-black text-dark uppercase">PDF Document</div>
                        <div className="text-[8px] text-slate-400 font-medium">Standard format</div>
                      </div>
                    </button>
                    <button onClick={() => { onExportWord(setQuestions); setShowExportMenu(false); }} className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-left group">
                      <div className="w-6 h-6 rounded bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={12} /></div>
                      <div>
                        <div className="text-[9px] font-black text-dark uppercase">Word Document</div>
                        <div className="text-[8px] text-slate-400 font-medium">Editable DOCX format</div>
                      </div>
                    </button>
                    <button onClick={() => { onExportJSON(undefined, setQuestions); setShowExportMenu(false); }} className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-left group">
                      <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FileJson size={12} /></div>
                      <div>
                        <div className="text-[9px] font-black text-dark uppercase">JSON Data</div>
                        <div className="text-[8px] text-slate-400 font-medium">Raw structured data</div>
                      </div>
                    </button>
                    <button onClick={() => { onExportTXT(setQuestions); setShowExportMenu(false); }} className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-left group">
                      <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform"><FileCode size={12} /></div>
                      <div>
                        <div className="text-[9px] font-black text-dark uppercase">Text Report</div>
                        <div className="text-[8px] text-slate-400 font-medium">Plain text format</div>
                      </div>
                    </button>
                    <button onClick={() => { onExportCSV(setQuestions); setShowExportMenu(false); }} className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-left group">
                      <div className="w-6 h-6 rounded bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FileCode size={12} /></div>
                      <div>
                        <div className="text-[9px] font-black text-dark uppercase">CSV Data</div>
                        <div className="text-[8px] text-slate-400 font-medium">Spreadsheet format</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {setQuestions.map((q) => (
                <QuestionCard 
                  key={q.id} 
                  question={q} 
                  viewMode="list"
                  onEdit={setEditingQuestion}
                />
              ))}
            </AnimatePresence>
            {setQuestions.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <FileText size={24} />
                </div>
                <h3 className="text-base font-black text-dark mb-1">No Questions Found</h3>
                <p className="text-xs text-slate-500">This set doesn't have any questions yet.</p>
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
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-dark font-display mb-0.5">Question Sets</h1>
            <p className="text-[10px] text-slate-500 font-medium">Manage and export your created question sets.</p>
          </div>
        </div>

        {safeSets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300">
              <Lock size={24} />
            </div>
            <h3 className="text-base font-black text-dark mb-1">No Sets Created</h3>
            <p className="text-[10px] text-slate-500 max-w-md mx-auto">Select questions from the Question Bank to create your first set.</p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {safeSets.map(set => (
                <motion.div 
                  key={set.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        {set.password ? <Lock size={16} /> : <FileText size={16} />}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteSet(set.id); }}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h3 className="text-sm font-black text-dark mb-0.5 truncate">{set.name}</h3>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>ID: {set.id}</span>
                      <span>•</span>
                      <span>{set.questionIds.length} Qs</span>
                    </div>
                  </div>
                  
                  {selectedSet?.id === set.id && set.password && !unlockedSets.has(set.id) ? (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      onSubmit={handleUnlock} 
                      className="px-3 pb-3 pt-1.5 border-t border-slate-50 bg-slate-50/50"
                    >
                      <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Enter Password</label>
                      <div className="flex gap-1.5 mb-1">
                        <input 
                          type="password" 
                          value={passwordInput}
                          onChange={e => setPasswordInput(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-md px-2 py-1 text-[10px] focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
                          placeholder="Password..."
                          autoFocus
                        />
                        <button type="submit" className="px-2 py-1 bg-primary text-white rounded-md hover:bg-secondary transition-colors">
                          <Key size={12} />
                        </button>
                      </div>
                      {error && <p className="text-[9px] text-red-500 font-medium">{error}</p>}
                    </motion.form>
                  ) : (
                    <div className="px-3 pb-3 pt-1.5 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                      <button 
                        onClick={() => handleSetClick(set)}
                        className="text-[9px] font-black uppercase text-primary hover:text-secondary transition-colors flex items-center gap-1"
                      >
                        Open Set <ChevronDown size={10} className="-rotate-90" />
                      </button>
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
