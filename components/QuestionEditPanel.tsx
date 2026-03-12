import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Maximize, Download, Printer, Save, Image as ImageIcon, Trash2, GripVertical,
  Bold, Italic, Underline, Strikethrough, Superscript, Subscript, List, ListOrdered, Table, Sigma
} from 'lucide-react';
import { Question } from '../types';

interface QuestionEditPanelProps {
  question: Question;
  onClose: () => void;
  onSave: (updatedQuestion: Question) => void;
  pdfUrl?: string; // Optional PDF URL for the viewer
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

  // Handle changes
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
    // Simulate API call
    setTimeout(() => {
      onSave(editedQuestion);
      setIsSaving(false);
      setIsDirty(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col w-full h-full max-w-7xl mx-auto bg-slate-50 shadow-2xl overflow-hidden">
        
        {/* Top Metadata Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {isDirty && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
              Edit Q#{question.question_number}
            </h2>
            <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:border-l md:border-slate-200 md:pl-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <button 
                onClick={() => {
                  setStatus(s => s === 'draft' ? 'published' : 'draft');
                  setIsDirty(true);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                  status === 'draft' 
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {status === 'draft' ? 'Draft' : 'Published'}
              </button>
            </div>

            <select 
              value={subject} 
              onChange={(e) => { setSubject(e.target.value); setIsDirty(true); }}
              className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Difficulty...</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="very_hard">Very Hard</option>
            </select>
          </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <select 
                value={questionType} 
                onChange={(e) => { setQuestionType(e.target.value); setIsDirty(true); }}
                className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mcq_single">MCQ Single</option>
                <option value="mcq_multiple">MCQ Multiple</option>
                <option value="integer">Integer Type</option>
                <option value="true_false">True/False</option>
                <option value="fill_blank">Fill in the Blank</option>
                <option value="assertion_reason">Assertion-Reason</option>
                <option value="match_column">Match the Column</option>
                <option value="numerical">Numerical Value</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isDirty && <span className="text-xs text-orange-500 font-medium">⚠ Make changes to enable save</span>}
            <button 
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                isDirty && !isSaving
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-4 bg-white border-b border-slate-200 shrink-0">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'ai' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles size={16} /> AI Edit
          </button>
          <button 
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'pdf' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileText size={16} /> Page {question.page_number}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Panel: PDF Viewer or AI Edit */}
          <div className="w-1/2 border-r border-slate-200 bg-slate-100 flex flex-col overflow-hidden">
            {activeTab === 'pdf' ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200 shrink-0">
                  <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    <ChevronLeft size={14} /> Viewing page {question.page_number} of source
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><ZoomOut size={14} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><ZoomIn size={14} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><Maximize size={14} /></button>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><Download size={14} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><Printer size={14} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
                  {/* Mock PDF Viewer */}
                  <div className="w-full max-w-lg aspect-[1/1.4] bg-white shadow-md relative">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-medium">
                      {pdfUrl ? "PDF Viewer Loading..." : "No PDF Source Available"}
                    </div>
                    {/* Mock Highlight */}
                    <div className="absolute top-1/4 left-10 right-10 h-32 bg-yellow-400/20 border-2 border-yellow-400/50 rounded pointer-events-none"></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-500" /> AI Assistant
                </h3>
                <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
                  <div className="flex-1 overflow-auto space-y-4">
                    <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-sm">
                      I can help you edit this question. What would you like to do?
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors">Rephrase</button>
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors">Fix Grammar</button>
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors">Translate</button>
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors">Detect Type</button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ask AI to edit this question..." 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Question Editor */}
          <div className="w-1/2 overflow-auto bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              
              <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium text-sm hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                + Add Passage/Instruction
              </button>

              {/* Question Stem */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    🔥 QUESTION
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Bold size={14} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Italic size={14} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Underline size={14} /></button>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Superscript size={14} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Subscript size={14} /></button>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Sigma size={14} /></button>
                  </div>
                </div>
                <textarea
                  value={editedQuestion.question_text}
                  onChange={(e) => handleChange('question_text', e.target.value)}
                  className="w-full p-4 min-h-[120px] text-sm text-slate-700 focus:outline-none resize-y"
                  placeholder="Enter question text here..."
                />
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-right">
                  {editedQuestion.question_text.length} characters
                </div>
              </div>

              {/* Image Manager */}
              {editedQuestion.diagram_url ? (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Attached Image</span>
                    <div className="flex gap-2">
                      <label className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                        Edit Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, 'question')} 
                        />
                      </label>
                      <button 
                        onClick={() => handleChange('diagram_url', undefined)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-2 flex justify-center">
                    <img src={editedQuestion.diagram_url} alt="Question Diagram" className="max-h-40 object-contain rounded" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Add caption..." 
                    value={editedQuestion.diagram_alt_text || ''}
                    onChange={(e) => handleChange('diagram_alt_text', e.target.value)}
                    className="w-full mt-3 px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-400"
                  />
                </div>
              ) : (
                <label className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium text-sm hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <ImageIcon size={24} className="text-slate-400" />
                  🖼 Add Image (Optional)
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'question')} 
                  />
                </label>
              )}

              {/* Options Editor */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    OPTIONS
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {['A', 'B', 'C', 'D'].map((label) => (
                    <div key={label} className="flex items-start gap-3 group">
                      <div className="mt-2 text-slate-300 cursor-grab hover:text-slate-500"><GripVertical size={16} /></div>
                      <div className="mt-2 font-bold text-slate-500 w-6">({label})</div>
                      <div className="flex-1 relative flex flex-col gap-2">
                        <textarea
                          value={(editedQuestion.options as any)[label] || ''}
                          onChange={(e) => handleOptionChange(label, e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none min-h-[40px]"
                          rows={1}
                        />
                        {(editedQuestion.options as any)[`${label}_diagram_url`] ? (
                          <div className="relative inline-block w-max">
                            <img 
                              src={(editedQuestion.options as any)[`${label}_diagram_url`]} 
                              alt={`Option ${label}`} 
                              className="max-h-24 object-contain rounded border border-slate-200" 
                            />
                            <button 
                              onClick={() => handleOptionChange(`${label}_diagram_url`, undefined as any)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 w-max">
                            <ImageIcon size={14} /> Add Image
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, label as 'A' | 'B' | 'C' | 'D')} 
                            />
                          </label>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="radio" 
                            name="correct_answer" 
                            checked={editedQuestion.answer === label}
                            onChange={() => handleChange('answer', label)}
                            className="w-4 h-4 text-green-500 focus:ring-green-500 border-slate-300"
                          />
                          <span className="text-xs font-medium text-slate-600">Correct</span>
                        </label>
                        <button className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 ml-10">
                    + Add Option
                  </button>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Solution / Explanation (Optional)
                  </span>
                  <ChevronRight size={16} className={`text-slate-400 transition-transform ${showExplanation ? 'rotate-90' : ''}`} />
                </button>
                {showExplanation && (
                  <div className="p-4 border-t border-slate-200">
                    <textarea
                      value={editedQuestion.solution_eng || ''}
                      onChange={(e) => handleChange('solution_eng', e.target.value)}
                      className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 min-h-[100px]"
                      placeholder="Add step-by-step solution here..."
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={16} /> Previous
          </button>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Question {question.question_number} of 20
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Next <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
