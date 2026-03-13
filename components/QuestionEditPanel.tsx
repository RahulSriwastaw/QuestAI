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
    <div className="fixed inset-0 z-50 flex bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col w-full h-full max-w-7xl mx-auto bg-slate-50 shadow-2xl overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-3 py-2 bg-white border-b border-slate-200 shrink-0 gap-2">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
              Edit Q#{question.question_number}
            </h2>
            <button onClick={onClose} className="md:hidden p-1.5 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 md:border-l md:border-slate-200 md:pl-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-slate-500">Status:</span>
              <button 
                onClick={() => {
                  setStatus(s => s === 'draft' ? 'published' : 'draft');
                  setIsDirty(true);
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
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
              className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Difficulty...</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="very_hard">Very Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <select 
              value={questionType} 
              onChange={(e) => { setQuestionType(e.target.value); setIsDirty(true); }}
              className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

          <div className="flex items-center gap-2">
            {!isDirty && <span className="text-[10px] text-orange-500 font-medium">Make changes to enable save</span>}
            <button 
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                isDirty && !isSaving
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <><div className="w-3 h-3 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Save size={14} /> Save Changes</>
              )}
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center px-3 bg-white border-b border-slate-200 shrink-0">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'ai' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles size={14} /> AI Edit
          </button>
          <button 
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'pdf' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileText size={14} /> Page {question.page_number}
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          <div className="w-1/2 border-r border-slate-200 bg-slate-100 flex flex-col overflow-hidden">
            {activeTab === 'pdf' ? (
              <>
                <div className="flex items-center justify-between px-2 py-1.5 bg-white border-b border-slate-200 shrink-0">
                  <div className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                    <ChevronLeft size={12} /> Viewing page {question.page_number} of source
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><ZoomOut size={12} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><ZoomIn size={12} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><Maximize size={12} /></button>
                    <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><Download size={12} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><Printer size={12} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-3 flex items-center justify-center relative">
                  <div className="w-full max-w-lg aspect-square bg-white shadow-sm relative">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-medium text-xs">
                      {pdfUrl ? "PDF Viewer Loading..." : "No PDF Source Available"}
                    </div>
                    <div className="absolute top-[25%] left-10 right-10 h-24 bg-yellow-400 bg-opacity-20 border-2 border-yellow-400 border-opacity-50 rounded pointer-events-none"></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-500" /> AI Assistant
                </h3>
                <div className="flex-1 bg-white rounded-lg border border-slate-200 p-3 shadow-sm flex flex-col">
                  <div className="flex-1 overflow-auto space-y-3">
                    <div className="bg-purple-50 text-purple-800 p-2.5 rounded-md text-xs">
                      I can help you edit this question. What would you like to do?
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium rounded transition-colors">Rephrase</button>
                      <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium rounded transition-colors">Fix Grammar</button>
                      <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium rounded transition-colors">Translate</button>
                      <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium rounded transition-colors">Detect Type</button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ask AI to edit this question..." 
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-1/2 overflow-auto bg-slate-50 p-4">
            <div className="max-w-2xl mx-auto space-y-4">
              
              <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-medium text-xs hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                + Add Passage/Instruction
              </button>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    QUESTION
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Bold size={12} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Italic size={12} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Underline size={12} /></button>
                    <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Superscript size={12} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Subscript size={12} /></button>
                    <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><Sigma size={12} /></button>
                  </div>
                </div>
                <textarea
                  value={editedQuestion.question_text}
                  onChange={(e) => handleChange('question_text', e.target.value)}
                  className="w-full p-3 min-h-[100px] text-xs text-slate-700 focus:outline-none resize-y"
                  placeholder="Enter question text here..."
                />
                <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[9px] text-slate-400 text-right">
                  {editedQuestion.question_text.length} characters
                </div>
              </div>

              {editedQuestion.diagram_url ? (
                <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Attached Image</span>
                    <div className="flex gap-1.5">
                      <label className="text-[10px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
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
                        className="text-[10px] font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-100 rounded-md p-1.5 flex justify-center">
                    <img src={editedQuestion.diagram_url} alt="Question Diagram" className="max-h-32 object-contain rounded" />
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
                <label className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-medium text-xs hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                  <ImageIcon size={20} className="text-slate-400" />
                  Add Image (Optional)
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'question')} 
                  />
                </label>
              )}

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    OPTIONS
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  {['A', 'B', 'C', 'D'].map((label) => (
                    <div key={label} className="flex items-start gap-2 group">
                      <div className="mt-1.5 text-slate-300 cursor-grab hover:text-slate-500"><GripVertical size={14} /></div>
                      <div className="mt-1.5 font-bold text-slate-500 w-5 text-xs">({label})</div>
                      <div className="flex-1 relative flex flex-col gap-1.5">
                        <textarea
                          value={(editedQuestion.options as any)[label] || ''}
                          onChange={(e) => handleOptionChange(label, e.target.value)}
                          className="w-full p-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none min-h-[32px]"
                          rows={1}
                        />
                        {(editedQuestion.options as any)[`${label}_diagram_url`] ? (
                          <div className="relative inline-block w-max">
                            <img 
                              src={(editedQuestion.options as any)[`${label}_diagram_url`]} 
                              alt={`Option ${label}`} 
                              className="max-h-20 object-contain rounded border border-slate-200" 
                            />
                            <button 
                              onClick={() => handleOptionChange(`${label}_diagram_url`, undefined as any)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <label className="text-[10px] text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 w-max">
                            <ImageIcon size={12} /> Add Image
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, label as 'A' | 'B' | 'C' | 'D')} 
                            />
                          </label>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="correct_answer" 
                            checked={editedQuestion.answer === label}
                            onChange={() => handleChange('answer', label)}
                            className="w-3.5 h-3.5 text-green-500 focus:ring-green-500 border-slate-300"
                          />
                          <span className="text-[10px] font-medium text-slate-600">Correct</span>
                        </label>
                        <button className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 ml-8">
                    + Add Option
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full px-3 py-2 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Solution and Explanation (Optional)
                  </span>
                  <ChevronRight size={14} className={`text-slate-400 transition-transform ${showExplanation ? 'rotate-90' : ''}`} />
                </button>
                {showExplanation && (
                  <div className="p-3 border-t border-slate-200">
                    <textarea
                      value={editedQuestion.solution_eng || ''}
                      onChange={(e) => handleChange('solution_eng', e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 min-h-[80px]"
                      placeholder="Add step-by-step solution here..."
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-slate-200 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <ChevronLeft size={14} /> Previous
          </button>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Question {question.question_number} of 20
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
