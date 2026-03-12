import React, { useState } from 'react';
import { LayoutGrid, Type, Image as ImageIcon, Square, Table, HelpCircle, Sparkles, Folder, Save, Trash2, Layers, Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown } from 'lucide-react';
import { CanvasElement, DocumentState } from './types';
import { BankQuestion } from '../../types';
import { generateDesignElements } from '../../services/geminiService';

interface LeftPanelProps {
  onAddElement: (element: CanvasElement) => void;
  onAddElements: (elements: CanvasElement[]) => void;
  onLoadDocument: (doc: DocumentState) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onSelectElements: (ids: string[]) => void;
  bankQuestions: BankQuestion[];
  currentDocument: DocumentState;
  currentPageId: string;
  selectedElementIds: string[];
  folders: { id: string, name: string }[];
  activeFolderId: string | null;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onSetActiveFolder: (id: string | null) => void;
}

export function LeftPanel({ 
  onAddElement, 
  onAddElements, 
  onLoadDocument, 
  onUpdateElement,
  onSelectElements,
  bankQuestions, 
  currentDocument,
  currentPageId,
  selectedElementIds,
  folders,
  activeFolderId,
  onAddFolder,
  onDeleteFolder,
  onSetActiveFolder
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<'elements' | 'text' | 'images' | 'shapes' | 'tables' | 'qbank' | 'ai' | 'templates' | 'layers'>('elements');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const elements = await generateDesignElements(aiPrompt);
      const canvasElements = elements.map((el: any) => ({
        ...el,
        id: Date.now().toString() + Math.random(),
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
        zIndex: 0,
        ...(el.type === 'text' ? { fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', align: 'left' } : {}),
        ...(el.type === 'shape' ? { stroke: '#000000', strokeWidth: 1 } : {}),
      }));
      onAddElements(canvasElements);
      setAiPrompt('');
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  const [savedTemplates, setSavedTemplates] = useState<DocumentState[]>(() => {
    const saved = localStorage.getItem('eduhub_templates');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveTemplate = () => {
    const newTemplate = { ...currentDocument, id: `template-${Date.now()}` };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('eduhub_templates', JSON.stringify(updated));
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('eduhub_templates', JSON.stringify(updated));
  };

  const filteredQuestions = bankQuestions.filter(q => 
    q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.question_hin && q.question_hin.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tabs = [
    { id: 'elements', icon: LayoutGrid, label: 'Elements' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'images', icon: ImageIcon, label: 'Images' },
    { id: 'shapes', icon: Square, label: 'Shapes' },
    { id: 'tables', icon: Table, label: 'Tables' },
    { id: 'qbank', icon: HelpCircle, label: 'Q-Bank' },
    { id: 'ai', icon: Sparkles, label: 'AI' },
    { id: 'layers', icon: Layers, label: 'Layers' },
    { id: 'templates', icon: Folder, label: 'Templates' },
  ] as const;

  const handleAddText = (type: 'heading' | 'subheading' | 'body') => {
    const baseText = {
      id: Date.now().toString(),
      type: 'text' as const,
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      zIndex: 0,
      fontFamily: 'Arial',
      fill: '#000000',
      fontWeight: 'normal' as const,
      fontStyle: 'normal' as const,
      textDecoration: 'none' as const,
      align: 'left' as const,
    };

    if (type === 'heading') {
      onAddElement({ ...baseText, text: 'Add a heading', fontSize: 36, fontWeight: 'bold' });
    } else if (type === 'subheading') {
      onAddElement({ ...baseText, text: 'Add a subheading', fontSize: 24, fontWeight: 'bold' });
    } else {
      onAddElement({ ...baseText, text: 'Add a little bit of body text', fontSize: 16 });
    }
  };

  const handleAddShape = (shapeType: 'rect' | 'circle' | 'triangle' | 'star') => {
    onAddElement({
      id: Date.now().toString(),
      type: 'shape',
      shapeType,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      zIndex: 0,
      fill: '#E2E8F0',
      stroke: '#94A3B8',
      strokeWidth: 2,
      cornerRadius: shapeType === 'rect' ? 0 : undefined,
    });
  };

  return (
    <div className="flex h-full bg-white border-r border-slate-200 z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      {/* Tab Icons */}
      <div className="w-16 flex flex-col items-center py-4 gap-2 bg-slate-50 border-r border-slate-200 overflow-y-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <tab.icon size={20} className="mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-72 flex flex-col overflow-y-auto p-4">
        <h3 className="text-lg font-black text-slate-800 mb-4 capitalize">{activeTab}</h3>
        
        {activeTab === 'text' && (
          <div className="space-y-3">
            <button 
              onClick={() => handleAddText('heading')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors"
            >
              <span className="text-2xl font-bold text-slate-800 block">Add a heading</span>
            </button>
            <button 
              onClick={() => handleAddText('subheading')}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors"
            >
              <span className="text-lg font-bold text-slate-700 block">Add a subheading</span>
            </button>
            <button 
              onClick={() => handleAddText('body')}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors"
            >
              <span className="text-sm text-slate-600 block">Add a little bit of body text</span>
            </button>
          </div>
        )}

        {activeTab === 'shapes' && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleAddShape('rect')} className="aspect-square bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center transition-colors">
              <div className="w-12 h-12 border-2 border-slate-400"></div>
            </button>
            <button onClick={() => handleAddShape('circle')} className="aspect-square bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center transition-colors">
              <div className="w-12 h-12 border-2 border-slate-400 rounded-full"></div>
            </button>
            <button onClick={() => handleAddShape('triangle')} className="aspect-square bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center transition-colors">
              <div className="w-0 h-0 border-l-[24px] border-l-transparent border-b-[40px] border-b-slate-400 border-r-[24px] border-r-transparent"></div>
            </button>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { rows: 3, cols: 2, label: '3x2 Table' },
                { rows: 4, cols: 3, label: '4x3 Table' },
                { rows: 5, cols: 5, label: '5x5 Grid' },
              ].map((preset, idx) => (
                <button 
                  key={idx}
                  onClick={() => onAddElement({
                    id: Date.now().toString(),
                    type: 'table',
                    rows: preset.rows,
                    cols: preset.cols,
                    data: Array(preset.rows).fill(0).map(() => Array(preset.cols).fill('')),
                    x: 100,
                    y: 100,
                    width: preset.cols * 100,
                    height: preset.rows * 40,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    hidden: false,
                    zIndex: 0,
                  })}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-colors group"
                >
                  <Table size={24} className="mx-auto mb-2 text-slate-400 group-hover:text-blue-500" />
                  <span className="text-xs font-bold text-slate-600">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'qbank' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
              <p className="text-xs text-blue-800 font-medium">
                EduHub Exclusive: Drag and drop questions directly from your Question Bank onto the canvas.
              </p>
              <button 
                onClick={() => onAddElements(filteredQuestions.map(q => ({
                  id: Date.now().toString() + q.id,
                  type: 'question_block',
                  questionId: q.id,
                  questionText: q.question_text,
                  options: q.options,
                  diagramUrl: q.diagram_url,
                  x: 100,
                  y: 100 + (filteredQuestions.indexOf(q) * 160),
                  width: 400,
                  height: 150,
                  rotation: 0,
                  opacity: 1,
                  locked: false,
                  hidden: false,
                  zIndex: 0,
                  fontSize: 14,
                  fontFamily: 'Arial',
                  fill: '#000000',
                })))}
                className="w-full py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                Add Entire Set to Canvas
              </button>
            </div>

            {/* Folders Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Folders</h4>
                <button 
                  onClick={() => {
                    const name = prompt('Enter folder name:');
                    if (name) onAddFolder(name);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Folder size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSetActiveFolder(null)}
                  className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                    activeFolderId === null 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                  }`}
                >
                  All
                </button>
                {folders.map(folder => (
                  <div key={folder.id} className="relative group">
                    <button
                      onClick={() => onSetActiveFolder(folder.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-full border transition-all pr-6 ${
                        activeFolderId === folder.id 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                      }`}
                    >
                      {folder.name}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFolder(folder.id);
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <input 
              type="text" 
              placeholder="Search questions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <div className="space-y-3">
              {bankQuestions
                .filter(q => !activeFolderId || q.folderId === activeFolderId)
                .filter(q => 
                  q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (q.question_hin && q.question_hin.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No questions found.</p>
              ) : (
                bankQuestions
                  .filter(q => !activeFolderId || q.folderId === activeFolderId)
                  .filter(q => 
                    q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (q.question_hin && q.question_hin.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map(q => (
                  <div key={q.id} className="p-3 border border-slate-200 rounded-xl hover:border-blue-400 cursor-grab active:cursor-grabbing transition-colors bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">Q{q.question_number}.</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-bold">MCQ</span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {q.question_text}
                    </p>
                    <button 
                      onClick={() => onAddElement({
                        id: Date.now().toString(),
                        type: 'question_block',
                        questionId: q.id,
                        questionText: q.question_text,
                        options: q.options,
                        diagramUrl: q.diagram_url,
                        x: 100,
                        y: 100,
                        width: 400,
                        height: 150,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: 0,
                        fontSize: 14,
                        fontFamily: 'Arial',
                        fill: '#000000',
                      })}
                      className="mt-3 w-full py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      + Add to Canvas
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl">
              <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-500" /> AI Assistant
              </h4>
              <p className="text-xs text-purple-700 mb-4">
                Describe what you want to create or edit.
              </p>
              <textarea 
                className="w-full p-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 resize-none h-24 bg-white"
                placeholder="e.g., Generate 5 MCQs on Quadratic Equations..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <button 
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className={`w-full mt-2 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-4">
            <label className="block w-full p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors text-center">
              <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
              <span className="text-sm font-bold text-slate-600">Upload Image</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      onAddElement({
                        id: Date.now().toString(),
                        type: 'image',
                        src: event.target?.result as string,
                        x: 100,
                        y: 100,
                        width: 200,
                        height: 200,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: 0,
                        cornerRadius: 0,
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="space-y-2">
            {currentDocument.pages.find(p => p.id === currentPageId)?.elements
              .sort((a, b) => b.zIndex - a.zIndex)
              .map(el => (
                <div 
                  key={el.id}
                  onClick={() => onSelectElements([el.id])}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                    selectedElementIds.includes(el.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400 shrink-0">
                    {el.type === 'text' && <Type size={14} />}
                    {el.type === 'image' && <ImageIcon size={14} />}
                    {el.type === 'shape' && <Square size={14} />}
                    {el.type === 'table' && <Table size={14} />}
                    {el.type === 'question_block' && <HelpCircle size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {el.type === 'text' ? (el as any).text : el.type}
                    </p>
                    <p className="text-[10px] text-slate-400">Z-Index: {el.zIndex}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateElement(el.id, { hidden: !el.hidden });
                      }}
                      className={`p-1 rounded hover:bg-slate-100 ${el.hidden ? 'text-red-500' : 'text-slate-400'}`}
                    >
                      {el.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateElement(el.id, { locked: !el.locked });
                      }}
                      className={`p-1 rounded hover:bg-slate-100 ${el.locked ? 'text-orange-500' : 'text-slate-400'}`}
                    >
                      {el.locked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <button 
              onClick={handleSaveTemplate}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Save size={18} /> Save Current as Template
            </button>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Saved Templates</h4>
              {savedTemplates.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Folder size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No templates saved yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {savedTemplates.map(template => (
                    <div key={template.id} className="group relative bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-400 transition-all shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-800 truncate pr-8">{template.title}</span>
                        <button 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onLoadDocument(template)}
                          className="flex-1 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Load Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
