import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, BankQuestion, Question, QuestionSet } from '../types';
import { 
  Folder as FolderIcon, 
  Search, 
  Plus, 
  ChevronRight, 
  MoreVertical,
  FileText,
  Trash2,
  Edit2,
  Download,
  Filter,
  ChevronDown,
  FileCode,
  FileJson,
  X,
  CheckSquare,
  Square,
  Lock,
  LayoutGrid,
  Tag,
  UploadCloud,
  Database,
  Sparkles,
  Layers
} from 'lucide-react';
import QuestionCard from './QuestionCard';
import BulkAIEditModal from './BulkAIEditModal';
import BulkTagModal from './BulkTagModal';
import { QuestionEditPanel } from './QuestionEditPanel';
import { useNavigate } from 'react-router-dom';

interface QuestionBankProps {
  questions: BankQuestion[];
  folders: Folder[];
  currentFolderId: string | null;
  onFolderChange: (id: string | null) => void;
  onAddFolder: (name: string, parentId: string | null) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onUpdateQuestion?: (question: Question) => void;
  onExportPDF: (questions: Question[]) => void;
  onExportWord: (questions: Question[]) => void;
  onExportJSON: (customFields?: string[], questions?: Question[]) => void;
  onExportTXT: (questions: Question[]) => void;
  onExportCSV: (questions: Question[]) => void;
  onImportCSV: (file: File) => void;
  onCreateSet: (name: string, password: string | undefined, questionIds: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkEdit: (ids: string[], prompt: string) => void;
  onBulkUpdate: (ids: string[], updates: Partial<Question>, mode?: 'add' | 'replace') => void;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ 
  questions, 
  folders, 
  currentFolderId,
  onFolderChange,
  onAddFolder, 
  onDeleteFolder,
  onDeleteQuestion,
  onUpdateQuestion,
  onExportPDF,
  onExportWord,
  onExportJSON,
  onExportTXT,
  onExportCSV,
  onImportCSV,
  onCreateSet,
  onBulkDelete,
  onBulkEdit,
  onBulkUpdate
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showBulkAIEditModal, setShowBulkAIEditModal] = useState(false);
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [showCreateSetModal, setShowCreateSetModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetPassword, setNewSetPassword] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'bulk' | 'documents'>('bulk');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [refinementTab, setRefinementTab] = useState<'pending' | 'final'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const safeFolders = folders || [];
  const safeQuestions = questions || [];

  const exams = useMemo(() => ['All', ...Array.from(new Set(safeQuestions.map(q => q.exam || 'Unknown')))], [safeQuestions]);
  const subjects = useMemo(() => ['All', ...Array.from(new Set(safeQuestions.map(q => q.subject || 'Unknown')))], [safeQuestions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCSV(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  const hasFoldersInCurrentDir = safeFolders.some(f => f && f.parentId === currentFolderId);
  const currentFolders = safeFolders.filter(f => 
    f && f.parentId === currentFolderId && 
    (f.name || '').toLowerCase().includes((folderSearchQuery || '').toLowerCase())
  );
  
  const allQuestions = safeQuestions.filter(q => {
    const qText = String(q.question_text || '');
    const qHin = String(q.question_hin || '');
    const search = String(searchQuery || '').toLowerCase();
    const matchesSearch = qText.toLowerCase().includes(search) || 
                          qHin.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'all' || (q.status === statusFilter);
    const qRefinement = q.refinementStatus || 'pending';
    const matchesRefinement = refinementTab === 'pending' ? (qRefinement !== 'final') : (qRefinement === 'final');
    const matchesExam = selectedExam === 'All' || q.exam === selectedExam;
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    return matchesSearch && matchesStatus && matchesRefinement && matchesExam && matchesSubject;
  });

  const totalPages = Math.ceil(allQuestions.length / itemsPerPage);
  const paginatedQuestions = allQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderTableView = () => (
    <div className="overflow-x-auto bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-5">ID</th>
            <th className="px-6 py-5">Intelligence Fragment</th>
            <th className="px-6 py-5">Domain</th>
            <th className="px-6 py-5">Framework</th>
            <th className="px-6 py-5">Target</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {paginatedQuestions.map((q) => (
            <tr key={q.id} className="hover:bg-primary/[0.02] transition-colors group cursor-pointer" onClick={() => setEditingQuestion(q)}>
              <td className="px-6 py-4 font-black text-slate-400 text-[10px]">{q.question_number}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1 max-w-md">
                  <div 
                    className="font-bold text-dark truncate text-[11px]"
                    dangerouslySetInnerHTML={{ __html: q.question_text.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...' }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">MCQ</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pg {q.page_number}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-black text-[9px] uppercase tracking-wider">
                  {q.subject || 'General'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-slate-500 font-bold text-[10px]">{q.exam || 'Standard'}</span>
              </td>
              <td className="px-6 py-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[10px] border border-emerald-100 shadow-sm">
                  {q.answer}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const currentQuestions = safeQuestions.filter(q => {
    const inFolder = q.folderId === currentFolderId;
    const qText = String(q.question_text || '');
    const qHin = String(q.question_hin || '');
    const search = String(searchQuery || '').toLowerCase();
    const matchesSearch = qText.toLowerCase().includes(search) || 
                          qHin.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'all' || (q.status === statusFilter);
    return inFolder && matchesSearch && matchesStatus;
  });

  const questionsByDocument = currentQuestions.reduce((acc, q) => {
    const docName = (q.id || '').split('-')[0] || 'Unknown'; // Assuming doc ID is part of question ID
    if (!acc[docName]) acc[docName] = [];
    acc[docName].push(q);
    return acc;
  }, {} as Record<string, BankQuestion[]>);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const handleCreateSet = () => {
    if (newSetName.trim() && selectedQuestionIds.size > 0) {
      onCreateSet(newSetName.trim(), newSetPassword.trim() || undefined, Array.from(selectedQuestionIds));
      setNewSetName('');
      setNewSetPassword('');
      setShowCreateSetModal(false);
      setSelectedQuestionIds(new Set());
    }
  };

  const toggleQuestionSelection = (id: string) => {
    const newSelection = new Set(selectedQuestionIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedQuestionIds(newSelection);
  };

  const selectAllQuestions = () => {
    const questionsToSelect = activeTab === 'bulk' ? allQuestions : currentQuestions;
    if (selectedQuestionIds.size === questionsToSelect.length && questionsToSelect.length > 0) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(questionsToSelect.map(q => q.id)));
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs: { id: string | null, name: string }[] = [{ id: null, name: 'Root' }];
    let currentId = currentFolderId;
    const path = [];
    while (currentId) {
      const folder = safeFolders.find(f => f && f.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return [...breadcrumbs, ...path];
  };

  const handleExport = (type: 'pdf' | 'word' | 'json' | 'txt' | 'csv') => {
    setShowExportMenu(false);
    if (currentQuestions.length === 0) return;
    
    switch (type) {
      case 'pdf': onExportPDF(currentQuestions); break;
      case 'word': onExportWord(currentQuestions); break;
      case 'json': onExportJSON(undefined, currentQuestions); break;
      case 'txt': onExportTXT(currentQuestions); break;
      case 'csv': onExportCSV(currentQuestions); break;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary rotate-3">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-dark font-display tracking-tight">Question Bank</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise Repository</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{allQuestions.length} Items</span>
                </div>
              </div>
            </div>
            
            <div className="flex bg-slate-100/80 p-1 rounded-2xl self-start backdrop-blur-sm border border-slate-200/50">
              <button 
                onClick={() => setActiveTab('bulk')}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'bulk' ? 'bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-dark'}`}
              >
                Bulk View
              </button>
              <button 
                onClick={() => setActiveTab('documents')}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'documents' ? 'bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-dark'}`}
              >
                Document View
              </button>
            </div>
          </div>
          
          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv, text/csv, application/csv" 
              className="hidden" 
            />
            <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-primary/30 transition-all flex items-center gap-2 shadow-sm group"
              >
                <UploadCloud size={14} className="text-primary group-hover:scale-110 transition-transform" /> Import CSV
              </button>
              <button 
                onClick={() => setShowNewFolderModal(true)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-primary/30 transition-all flex items-center gap-2 shadow-sm group"
              >
                <FolderIcon size={14} className="text-primary group-hover:scale-110 transition-transform" /> New Folder
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />

            {selectedQuestionIds.size > 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-wrap items-center gap-2 p-1 bg-primary/5 rounded-2xl border border-primary/10"
              >
                <button 
                  onClick={() => onBulkDelete(Array.from(selectedQuestionIds))}
                  className="px-4 py-2.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete ({selectedQuestionIds.size})
                </button>
                <button 
                  onClick={() => setShowBulkAIEditModal(true)}
                  className="px-4 py-2.5 bg-accent-2 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 shadow-lg shadow-accent-2/20 transition-all flex items-center gap-2"
                >
                  <Sparkles size={14} /> AI Refine
                </button>
                <button 
                  onClick={() => setShowBulkTagModal(true)}
                  className="px-4 py-2.5 bg-accent-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 shadow-lg shadow-accent-3/20 transition-all flex items-center gap-2"
                >
                  <Tag size={14} /> Bulk Tag
                </button>
                <button 
                  onClick={() => setShowCreateSetModal(true)}
                  className="px-4 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <CheckSquare size={14} /> Create Set
                </button>
                <button 
                  onClick={() => setSelectedQuestionIds(new Set())}
                  className="p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md group">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search your intelligence bank..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="pl-4 pr-10 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:border-primary/30 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat"
                  >
                    {exams.map(exam => <option key={exam} value={exam}>{exam}</option>)}
                  </select>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="pl-4 pr-10 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:border-primary/30 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat"
                  >
                    {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Layers size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <FileText size={16} />
                  </button>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={currentQuestions.length === 0}
                    className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 shadow-xl shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
                  >
                    <Download size={14} /> Export
                  </button>
                  <AnimatePresence>
                    {showExportMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-3 w-56 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden p-2"
                      >
                        <div className="px-4 py-3 border-b border-slate-50 mb-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Export Options</span>
                        </div>
                        <button onClick={() => navigate('/editor')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"><Sparkles size={12} /></div> Design Editor
                        </button>
                        <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center"><FileText size={12} className="text-red-500" /></div> PDF Document
                        </button>
                        <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center"><FileText size={12} className="text-blue-500" /></div> Word Document
                        </button>
                        <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center"><FileCode size={12} className="text-emerald-500" /></div> CSV Data
                        </button>
                        <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center"><FileJson size={12} className="text-amber-500" /></div> Custom JSON
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-8 py-3 bg-white/50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {getBreadcrumbs().map((crumb, index, array) => (
          <React.Fragment key={crumb.id || 'root'}>
            <button 
              onClick={() => onFolderChange(crumb.id)}
              className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all px-3 py-1.5 rounded-xl ${
                index === array.length - 1 ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-dark hover:bg-slate-100'
              }`}
            >
              {crumb.name}
            </button>
            {index < array.length - 1 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedQuestionIds.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-dark/90 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] flex items-center gap-8"
          >
            <div className="flex items-center gap-4 pr-8 border-r border-white/10">
              <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-lg shadow-primary/30">
                {selectedQuestionIds.size}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Selected Units</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Intelligence</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowBulkAIEditModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all group"
              >
                <Sparkles size={16} className="group-hover:scale-110 transition-transform" /> AI Refine
              </button>
              <button 
                onClick={() => setShowBulkTagModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all group"
              >
                <Tag size={16} className="group-hover:scale-110 transition-transform" /> Metadata
              </button>
              <button 
                onClick={() => setShowCreateSetModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all group"
              >
                <Layers size={16} className="group-hover:scale-110 transition-transform" /> Curate Set
              </button>
              <div className="w-px h-8 bg-white/10 mx-2" />
              <button 
                onClick={() => {
                  onBulkDelete(Array.from(selectedQuestionIds));
                  setSelectedQuestionIds(new Set());
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all group"
              >
                <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> Purge
              </button>
            </div>

            <button 
              onClick={() => setSelectedQuestionIds(new Set())}
              className="ml-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BulkAIEditModal 
        isOpen={showBulkAIEditModal}
        onClose={() => setShowBulkAIEditModal(false)}
        onApply={(instruction) => {
          onBulkEdit(Array.from(selectedQuestionIds), instruction);
          setShowBulkAIEditModal(false);
        }}
        selectedCount={selectedQuestionIds.size}
      />
      <BulkTagModal
        isOpen={showBulkTagModal}
        onClose={() => setShowBulkTagModal(false)}
        onApply={(tags, mode) => {
          onBulkUpdate(Array.from(selectedQuestionIds), { tags }, mode);
          setShowBulkTagModal(false);
          setSelectedQuestionIds(new Set());
        }}
        selectedCount={selectedQuestionIds.size}
      />
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {(activeTab === 'documents' && !hasFoldersInCurrentDir && currentQuestions.length === 0) || (activeTab === 'bulk' && allQuestions.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 rounded-3xl bg-slate-200 flex items-center justify-center text-slate-500">
              {activeTab === 'documents' ? <FolderIcon size={32} /> : <FileText size={32} />}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-500">
                {activeTab === 'documents' ? 'Empty Folder' : 'No Questions'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {activeTab === 'documents' ? 'No questions or subfolders here.' : 'No questions found matching your criteria.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Questions View */}
            {activeTab === 'bulk' ? (
              allQuestions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black text-dark uppercase tracking-[0.2em]">Intelligence Bank</h3>
                      <p className="text-[10px] font-medium text-slate-400">Showing {paginatedQuestions.length} of {allQuestions.length} questions</p>
                    </div>
                    <button 
                      onClick={selectAllQuestions}
                      className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 hover:border-primary/30 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                    >
                      {selectedQuestionIds.size === allQuestions.length ? (
                        <><CheckSquare size={14} /> Deselect All</>
                      ) : (
                        <><Square size={14} /> Select All</>
                      )}
                    </button>
                  </div>
                  <motion.div 
                    layout
                    className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : viewMode === 'list' ? "space-y-3" : ""}
                  >
                    {viewMode === 'table' ? renderTableView() : (
                      <AnimatePresence mode="popLayout">
                        {paginatedQuestions.map(q => (
                          <QuestionCard 
                            key={q.id} 
                            question={q} 
                            selected={selectedQuestionIds.has(q.id)}
                            viewMode={viewMode}
                            onSelect={toggleQuestionSelection}
                            onEdit={setEditingQuestion}
                            onDelete={() => setQuestionToDelete(q.id)}
                            onToggleStatus={(status) => onUpdateQuestion && onUpdateQuestion({ ...q, status })}
                            onToggleRefinement={(refinementStatus) => onUpdateQuestion && onUpdateQuestion({ ...q, refinementStatus })}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                  </motion.div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-slate-100">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                      >
                        Prev
                      </button>
                      <span className="text-xs font-bold text-slate-400">
                        {currentPage} / {totalPages}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-8">
                {/* Folders Grid */}
                {hasFoldersInCurrentDir && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Folders</h3>
                      <div className="relative w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search folders..." 
                          value={folderSearchQuery}
                          onChange={(e) => setFolderSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    {currentFolders.length > 0 ? (
                      <motion.div 
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      >
                        <AnimatePresence mode="popLayout">
                          {currentFolders.map(folder => (
                            <motion.div 
                              key={folder.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              onClick={() => onFolderChange(folder.id)}
                              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                                  <FolderIcon size={20} />
                                </div>
                                <span className="font-bold text-sm text-slate-700 truncate">{folder.name}</span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteFolder(folder.id);
                                }}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        No folders found matching "{folderSearchQuery}"
                      </div>
                    )}
                  </div>
                )}

                {/* Questions Grouped by Document */}
                {Object.keys(questionsByDocument).length > 0 && (
                  <div className="space-y-8">
                    {Object.entries(questionsByDocument).map(([docName, questions]) => (
                      <div key={docName}>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <FileText size={12} /> {docName} ({questions.length} questions)
                        </h3>
                        <motion.div 
                          layout
                          className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-2"}
                        >
                          <AnimatePresence mode="popLayout">
                            {questions.map(q => (
                              <QuestionCard 
                                key={q.id} 
                                question={q} 
                                selected={selectedQuestionIds.has(q.id)}
                                viewMode={viewMode}
                                onSelect={toggleQuestionSelection}
                                onEdit={setEditingQuestion}
                                onDelete={() => setQuestionToDelete(q.id)}
                                onToggleStatus={(status) => onUpdateQuestion && onUpdateQuestion({ ...q, status })}
                              />
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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

      {/* Delete Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-black text-dark mb-2">Delete Question?</h3>
              <p className="text-sm text-slate-500">Are you sure you want to delete this question? This action cannot be undone.</p>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setQuestionToDelete(null)}
                className="flex-1 px-4 py-2 text-[11px] font-black uppercase text-slate-500 hover:text-dark transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (questionToDelete) {
                    onDeleteQuestion(questionToDelete);
                    setQuestionToDelete(null);
                  }
                }}
                className="flex-1 px-6 py-2 bg-red-500 text-white text-[11px] font-black uppercase rounded-lg hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-dark">New Folder</h3>
              <button onClick={() => setShowNewFolderModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Folder Name</label>
              <input 
                type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Physics Chapter 1"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowNewFolderModal(false)}
                className="flex-1 px-4 py-3 text-[11px] font-black uppercase text-slate-500 hover:text-dark transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 px-6 py-3 bg-primary text-white text-[11px] font-black uppercase rounded-2xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Set Modal */}
      {showCreateSetModal && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-dark">Create Set</h3>
              <button onClick={() => setShowCreateSetModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Set Name</label>
                <input 
                  type="text" 
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="e.g. Physics Mock Test 1"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Lock size={12} /> Password (Optional)
                </label>
                <input 
                  type="password" 
                  value={newSetPassword}
                  onChange={(e) => setNewSetPassword(e.target.value)}
                  placeholder="Leave blank for no password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSet()}
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowCreateSetModal(false)}
                className="flex-1 px-4 py-3 text-[11px] font-black uppercase text-slate-500 hover:text-dark transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateSet}
                disabled={!newSetName.trim()}
                className="flex-1 px-6 py-3 bg-emerald-500 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Create Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
