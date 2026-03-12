import React, { useState, useEffect } from 'react';
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
  Tag
} from 'lucide-react';
import QuestionCard from './QuestionCard';
import BulkAIEditModal from './BulkAIEditModal';
import BulkTagModal from './BulkTagModal';
import { QuestionEditPanel } from './QuestionEditPanel';
import { useNavigate } from 'react-router-dom';

interface QuestionBankProps {
  questions: BankQuestion[];
  folders: Folder[];
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
}

const QuestionBank: React.FC<QuestionBankProps> = ({ 
  questions, 
  folders, 
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
  onBulkEdit
}) => {
  const navigate = useNavigate();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [refinementTab, setRefinementTab] = useState<'pending' | 'final'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  const safeFolders = folders || [];
  const safeQuestions = questions || [];

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
    return matchesSearch && matchesStatus && matchesRefinement;
  });

  const totalPages = Math.ceil(allQuestions.length / itemsPerPage);
  const paginatedQuestions = allQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCSV(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
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
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-dark font-display">Question Bank</h2>
            <p className="text-xs text-slate-400 font-medium">Manage and organize your questions</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl self-start">
            <button 
              onClick={() => setActiveTab('bulk')}
              className={`px-3 py-1.5 text-[10px] md:text-xs font-black uppercase rounded-lg transition-all ${activeTab === 'bulk' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-dark'}`}
            >
              Bulk
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 text-[10px] md:text-xs font-black uppercase rounded-lg transition-all ${activeTab === 'documents' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-dark'}`}
            >
              Docs
            </button>
          </div>
        </div>
        
        {/* Actions Bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <FileCode size={12} className="text-primary" /> Import
          </button>
          <button 
            onClick={() => setShowNewFolderModal(true)}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <FolderIcon size={12} className="text-primary" /> New Folder
          </button>
          {selectedQuestionIds.size > 0 && (
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button 
                onClick={() => onBulkDelete(Array.from(selectedQuestionIds))}
                className="px-3 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 size={12} /> Delete ({selectedQuestionIds.size})
              </button>
              <button 
                onClick={() => setShowBulkAIEditModal(true)}
                className="px-3 py-2 bg-purple-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-purple-600 shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
              >
                <Edit2 size={12} /> AI Edit
              </button>
              <button 
                onClick={() => setShowBulkTagModal(true)}
                className="px-3 py-2 bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <Tag size={12} /> Bulk Tag
              </button>
              <button 
                onClick={() => setShowCreateSetModal(true)}
                className="px-3 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <CheckSquare size={12} /> Create Set
              </button>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <LayoutGrid size={12} /> {viewMode === 'grid' ? 'List' : 'Grid'}
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={currentQuestions.length === 0}
              className="px-3 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-lg hover:bg-secondary shadow-lg shadow-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download size={12} /> Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <button onClick={() => navigate('/editor')} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Design Editor</button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">PDF Document</button>
                <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Word Document</button>
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">CSV</button>
                <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Custom JSON</button>
                <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Plain Text</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-6 py-3 bg-slate-100/50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        {getBreadcrumbs().map((crumb, index, array) => (
          <React.Fragment key={crumb.id || 'root'}>
            <button 
              onClick={() => setCurrentFolderId(crumb.id)}
              className={`text-xs font-bold whitespace-nowrap transition-colors ${
                index === array.length - 1 ? 'text-dark' : 'text-slate-400 hover:text-primary'
              }`}
            >
              {crumb.name}
            </button>
            {index < array.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
          </React.Fragment>
        ))}
      </div>

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
        onApply={(tags) => {
          selectedQuestionIds.forEach(id => {
            const question = safeQuestions.find(q => q.id === id);
            if (question) {
              onUpdateQuestion && onUpdateQuestion({ ...question, tags: [...(question.tags || []), ...tags] });
            }
          });
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">All Questions</h3>
                    <button 
                      onClick={selectAllQuestions}
                      className="text-[10px] font-black uppercase text-primary hover:text-secondary transition-colors flex items-center gap-1"
                    >
                      {selectedQuestionIds.size === allQuestions.length ? (
                        <><CheckSquare size={12} /> Deselect All</>
                      ) : (
                        <><Square size={12} /> Select All</>
                      )}
                    </button>
                  </div>
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                    {paginatedQuestions.map(q => (
                      <QuestionCard 
                        key={q.id} 
                        question={q} 
                        selected={selectedQuestionIds.has(q.id)}
                        onSelect={toggleQuestionSelection}
                        onEdit={setEditingQuestion}
                        onDelete={() => setQuestionToDelete(q.id)}
                        onToggleStatus={(status) => onUpdateQuestion && onUpdateQuestion({ ...q, status })}
                        onToggleRefinement={(refinementStatus) => onUpdateQuestion && onUpdateQuestion({ ...q, refinementStatus })}
                      />
                    ))}
                  </div>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {currentFolders.map(folder => (
                          <div 
                            key={folder.id}
                            onClick={() => setCurrentFolderId(folder.id)}
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
                          </div>
                        ))}
                      </div>
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
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                          {questions.map(q => (
                            <QuestionCard 
                              key={q.id} 
                              question={q} 
                              selected={selectedQuestionIds.has(q.id)}
                              onSelect={toggleQuestionSelection}
                              onEdit={setEditingQuestion}
                              onDelete={() => setQuestionToDelete(q.id)}
                              onToggleStatus={(status) => onUpdateQuestion && onUpdateQuestion({ ...q, status })}
                            />
                          ))}
                        </div>
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
