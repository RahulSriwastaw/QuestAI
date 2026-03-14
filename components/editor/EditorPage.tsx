import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Topbar } from './Topbar';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { CanvasArea } from './CanvasArea';
import { DocumentState, CanvasElement, Page, TextElement, QuestionBlockElement } from './types';
import { jsPDF } from 'jspdf';
import { supabase } from '../../services/supabaseClient';
import { BankQuestion } from '../../types';
import { Plus, Trash2, LayoutGrid, Loader2, RefreshCcw } from 'lucide-react';
import { suggestLayout } from '../../services/geminiService';

export default function EditorPage() {
  const stageRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);
  
  const [document, setDocument] = useState<DocumentState>({
    id: '1',
    title: 'Untitled Design',
    width: 794, // A4 width at 96 DPI
    height: 1123, // A4 height at 96 DPI
    pages: [{ 
      id: 'page-1', 
      elements: [
        {
          id: 'q-1',
          type: 'question_block',
          questionId: 'q-1',
          questionText: 'What is the capital of France?',
          options: { A: 'Paris', B: 'London', C: 'Berlin', D: 'Madrid' },
          x: 100,
          y: 100,
          width: 500,
          height: 250,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          zIndex: 1,
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#1e293b'
        }
      ], 
      background: '#FFFFFF' 
    }]
  });

  const [history, setHistory] = useState<DocumentState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPageId, setCurrentPageId] = useState<string>('page-1');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(0.8);
  const [showGrid, setShowGrid] = useState(false);
  const [isArranging, setIsArranging] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [clipboard, setClipboard] = useState<CanvasElement[]>([]);
  const [folders, setFolders] = useState<{id: string, name: string}[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const saveToHistory = (newDoc: DocumentState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newDoc)));
    
    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    setHistory(newHistory);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setDocument(JSON.parse(JSON.stringify(history[prevIndex])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setDocument(JSON.parse(JSON.stringify(history[nextIndex])));
    }
  };

  // Initial history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(document))]);
      setHistoryIndex(0);
    }
  }, []);

  const updateDocument = (newDoc: DocumentState | ((prev: DocumentState) => DocumentState), skipHistory = false) => {
    setDocument(prev => {
      const next = typeof newDoc === 'function' ? newDoc(prev) : newDoc;
      if (!skipHistory) {
        saveToHistory(next);
      }

      // Emit update to other users if it's not a remote update
      if (!isRemoteUpdate.current && socketRef.current) {
        socketRef.current.emit('update-document', {
          documentId: prev.id,
          state: next
        });
      }

      return next;
    });
  };

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to collaboration server');
      socket.emit('join-document', document.id);
    });

    socket.on('document-updated', (remoteState: DocumentState) => {
      isRemoteUpdate.current = true;
      setDocument(remoteState);
      // Also update history without saving a new state
      setHistory(prev => {
        const newHistory = [...prev];
        if (historyIndex >= 0) {
          newHistory[historyIndex] = JSON.parse(JSON.stringify(remoteState));
        }
        return newHistory;
      });
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 0);
    });

    return () => {
      socket.disconnect();
    };
  }, [document.id]);
  
  const handleExportDOCX = async () => {
    const doc = new Document({
      sections: document.pages.map(page => ({
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Page: ${page.id}`,
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          ...page.elements.map(el => {
            if (el.type === 'text') {
              const textEl = el as TextElement;
              return new Paragraph({
                children: [
                  new TextRun({
                    text: textEl.text,
                    size: textEl.fontSize * 2,
                    color: textEl.fill.replace('#', ''),
                    font: textEl.fontFamily,
                  }),
                ],
              });
            } else if (el.type === 'question_block') {
              const qEl = el as QuestionBlockElement;
              return [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: qEl.questionText,
                      bold: true,
                      size: qEl.fontSize * 2,
                    }),
                  ],
                  spacing: { before: 200 },
                }),
                ...Object.entries(qEl.options).map(([key, value]) => (
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${key}. ${value}`,
                        size: (qEl.fontSize - 2) * 2,
                      }),
                    ],
                    indent: { left: 720 },
                  })
                ))
              ];
            }
            return new Paragraph({ text: `[${el.type} element]` });
          }).flat(),
        ],
      })),
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${document.title}.docx`);
  };

  const handleDownload = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = window.document.createElement('a');
      link.download = `${document.title}.png`;
      link.href = dataURL;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF({
      orientation: document.width > document.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [document.width, document.height]
    });

    for (let i = 0; i < document.pages.length; i++) {
      const page = document.pages[i];
      setCurrentPageId(page.id);
      
      // Wait for state update and render
      await new Promise(resolve => setTimeout(resolve, 100));

      if (stageRef.current) {
        const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
        if (i > 0) pdf.addPage([document.width, document.height], document.width > document.height ? 'l' : 'p');
        pdf.addImage(dataURL, 'PNG', 0, 0, document.width, document.height);
      }
    }

    pdf.save(`${document.title}.pdf`);
    // Restore current page
    setCurrentPageId(document.pages[0].id);
  };

  const handleAddPage = () => {
    const newPageId = `page-${Date.now()}`;
    const newPage: Page = {
      id: newPageId,
      elements: [],
      background: '#FFFFFF'
    };
    updateDocument(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    setCurrentPageId(newPageId);
  };

  const handleDeletePage = (pageId: string) => {
    if (document.pages.length <= 1) return;
    updateDocument(prev => {
      const newPages = prev.pages.filter(p => p.id !== pageId);
      if (currentPageId === pageId) {
        setCurrentPageId(newPages[0].id);
      }
      return { ...prev, pages: newPages };
    });
  };

  const handleAutoArrange = async () => {
    if (currentPage.elements.length === 0) return;
    
    setIsArranging(true);
    try {
      const suggestions = await suggestLayout(currentPage.elements, document.width, document.height);
      
      if (suggestions && suggestions.length > 0) {
        updateDocument(prev => ({
          ...prev,
          pages: prev.pages.map(p => {
            if (p.id !== currentPageId) return p;
            return {
              ...p,
              elements: p.elements.map(el => {
                const suggestion = suggestions.find((s: any) => s.id === el.id);
                if (suggestion) {
                  return { ...el, x: suggestion.x, y: suggestion.y };
                }
                return el;
              })
            };
          })
        }));
      } else {
        // Fallback to simple arrange
        handleSimpleArrange();
      }
    } catch (error) {
      console.error("AI Arrange failed:", error);
      handleSimpleArrange();
    } finally {
      setIsArranging(false);
    }
  };

  const handleClearPage = () => {
    updateDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === currentPageId ? { ...p, elements: [] } : p)
    }));
    setSelectedElementIds([]);
  };

  const handleSimpleArrange = () => {
    updateDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => {
        if (p.id !== currentPageId) return p;
        
        let currentY = 50;
        const margin = 50;
        const spacing = 20;
        
        const arrangedElements = p.elements.map(el => {
          const newEl = { ...el, x: margin, y: currentY };
          const height = el.height || 100;
          currentY += height + spacing;
          return newEl;
        });

        return { ...p, elements: arrangedElements };
      })
    }));
  };

  const handleCopy = () => {
    if (selectedElementIds.length > 0) {
      const currentPage = document.pages.find(p => p.id === currentPageId);
      if (currentPage) {
        const elementsToCopy = currentPage.elements.filter(el => selectedElementIds.includes(el.id));
        setClipboard(elementsToCopy);
      }
    }
  };

  const handlePaste = () => {
    if (clipboard.length > 0) {
      const newElements = clipboard.map(el => ({
        ...el,
        id: Date.now().toString() + Math.random(),
        x: el.x + 20,
        y: el.y + 20,
      }));
      handleAddElements(newElements);
      setSelectedElementIds(newElements.map(el => el.id));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
          handleCopy();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
          handlePaste();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0 && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
          selectedElementIds.forEach(id => handleDeleteElement(id));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedElementIds]);

  useEffect(() => {
    const fetchBankQuestions = async () => {
      try {
        const { data, error } = await supabase.from('bank_questions').select('*');
        if (error) throw error;
        
        if (data) {
          const mappedQuestions: BankQuestion[] = data.map(q => ({
            id: q.id,
            folderId: q.folder_id || null,
            savedAt: Number(q.saved_at),
            ...q.question_data
          }));
          setBankQuestions(mappedQuestions);
        }
      } catch (err) {
        console.error('Error fetching questions from Supabase:', err);
      }
    };

    fetchBankQuestions();
  }, []);

  const currentPage = document.pages.find(p => p.id === currentPageId) || document.pages[0];
  const selectedElements = currentPage.elements.filter(el => selectedElementIds.includes(el.id));

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    updateDocument(prev => {
      const currentPage = prev.pages.find(p => p.id === currentPageId);
      if (!currentPage) return prev;

      const element = currentPage.elements.find(el => el.id === id);
      if (!element) return prev;

      // If moving an element that is part of a group, move the whole group
      if (element.groupId && (updates.x !== undefined || updates.y !== undefined)) {
        const dx = updates.x !== undefined ? updates.x - element.x : 0;
        const dy = updates.y !== undefined ? updates.y - element.y : 0;

        return {
          ...prev,
          pages: prev.pages.map(p => p.id === currentPageId ? {
            ...p,
            elements: p.elements.map(el => {
              if (el.groupId === element.groupId) {
                return {
                  ...el,
                  x: el.x + dx,
                  y: el.y + dy,
                  ...(updates.rotation !== undefined ? { rotation: updates.rotation } : {}),
                  ...(updates.opacity !== undefined ? { opacity: updates.opacity } : {}),
                } as CanvasElement;
              }
              if (el.id === id) {
                return { ...el, ...updates } as CanvasElement;
              }
              return el;
            })
          } : p)
        };
      }

      return {
        ...prev,
        pages: prev.pages.map(p => p.id === currentPageId ? {
          ...p,
          elements: p.elements.map(el => el.id === id ? { ...el, ...updates } as CanvasElement : el)
        } : p)
      };
    });
  };

  const handleBatchUpdateElements = (updates: { id: string, updates: Partial<CanvasElement> }[]) => {
    updateDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === currentPageId ? {
        ...p,
        elements: p.elements.map(el => {
          const update = updates.find(u => u.id === el.id);
          return update ? { ...el, ...update.updates } as CanvasElement : el;
        })
      } : p)
    }));
  };

  const handleAddFolder = (name: string) => {
    const newFolder = { id: Date.now().toString(), name };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    if (activeFolderId === id) setActiveFolderId(null);
  };

  const handleUpdateElements = (ids: string[], updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => {
    updateDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === currentPageId ? {
        ...p,
        elements: p.elements.map(el => {
          if (ids.includes(el.id)) {
            const elementUpdates = typeof updates === 'function' ? updates(el) : updates;
            return { ...el, ...elementUpdates } as CanvasElement;
          }
          return el;
        })
      } : p)
    }));
  };

  const handleGroup = () => {
    if (selectedElementIds.length < 2) return;
    const groupId = `group-${Date.now()}`;
    handleUpdateElements(selectedElementIds, { groupId });
  };

  const handleUngroup = () => {
    const groupIds = selectedElements
      .map(el => el.groupId)
      .filter((id): id is string => !!id);
    
    if (groupIds.length === 0) return;

    updateDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === currentPageId ? {
        ...p,
        elements: p.elements.map(el => {
          if (el.groupId && groupIds.includes(el.groupId)) {
            const { groupId, ...rest } = el;
            return rest as CanvasElement;
          }
          return el;
        })
      } : p)
    }));
  };

  const handleAddElement = (element: CanvasElement) => {
    updateDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === currentPageId ? {
        ...p,
        elements: [...p.elements, element]
      } : p)
    }));
    setSelectedElementIds([element.id]);
  };

  const handleAddElements = (elements: CanvasElement[]) => {
    updateDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === currentPageId ? {
        ...p,
        elements: [...p.elements, ...elements]
      } : p)
    }));
    setSelectedElementIds(elements.map(el => el.id));
  };

  const handleLoadDocument = (doc: DocumentState) => {
    updateDocument(doc);
    setCurrentPageId(doc.pages[0].id);
    setSelectedElementIds([]);
  };

  const handleDeleteElement = (id: string) => {
    updateDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === currentPageId ? {
        ...p,
        elements: p.elements.filter(el => el.id !== id)
      } : p)
    }));
    setSelectedElementIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleDuplicateElement = () => {
    const elementsToDuplicate = selectedElements;
    if (elementsToDuplicate.length === 0) return;

    const newElements = elementsToDuplicate.map(el => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: el.x + 20,
      y: el.y + 20,
      zIndex: el.zIndex + 1
    }));

    handleAddElements(newElements);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        if (selectedElementIds.length > 0) {
          selectedElementIds.forEach(id => handleDeleteElement(id));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      <Topbar 
        title={document.title} 
        onTitleChange={(title) => updateDocument(prev => ({ ...prev, title }))}
        zoom={zoom}
        onZoomChange={setZoom}
        onDownload={handleDownload}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
        onAutoArrange={handleAutoArrange}
        isArranging={isArranging}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel 
          onAddElement={handleAddElement} 
          onAddElements={handleAddElements} 
          onLoadDocument={handleLoadDocument}
          onUpdateElement={handleUpdateElement}
          onSelectElements={setSelectedElementIds}
          bankQuestions={bankQuestions} 
          currentDocument={document}
          currentPageId={currentPageId}
          selectedElementIds={selectedElementIds}
          folders={folders}
          activeFolderId={activeFolderId}
          onAddFolder={handleAddFolder}
          onDeleteFolder={handleDeleteFolder}
          onSetActiveFolder={setActiveFolderId}
        />
        
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPageId}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <CanvasArea 
                page={currentPage}
                width={document.width}
                height={document.height}
                zoom={zoom}
                showGrid={showGrid}
                selectedElementIds={selectedElementIds}
                onSelectElements={setSelectedElementIds}
                onUpdateElement={handleUpdateElement}
                onUpdateElements={handleBatchUpdateElements}
                stageRef={stageRef}
              />
            </motion.div>
          </AnimatePresence>

          {/* Page Navigator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full shadow-lg px-4 py-2 flex items-center gap-4 z-20">
            <div className="flex items-center gap-2">
              {document.pages.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentPageId(p.id)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    currentPageId === p.id 
                      ? 'bg-blue-600 text-white scale-110 shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <button 
              onClick={handleAddPage}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
              title="Add Page"
            >
              <Plus size={18} />
            </button>
            {document.pages.length > 1 && (
              <button 
                onClick={() => handleDeletePage(currentPageId)}
                className="p-1.5 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                title="Delete Current Page"
              >
                <Trash2 size={18} />
              </button>
            )}
            <div className="h-4 w-px bg-slate-200"></div>
            <button 
              onClick={handleClearPage}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
              title="Clear Page"
            >
              <RefreshCcw size={18} />
            </button>
            <button 
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-full transition-colors ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Toggle Grid"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
        
        <RightPanel 
          selectedElements={selectedElements}
          onUpdateElement={handleUpdateElement}
          onUpdateElements={handleUpdateElements}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
          pageBackground={currentPage.background}
          onPageBackgroundChange={(bg) => {
            updateDocument(prev => ({
              ...prev,
              pages: prev.pages.map(p => p.id === currentPageId ? { ...p, background: bg } : p)
            }));
          }}
        />
      </div>
    </div>
  );
}
