import React, { useState } from 'react';
import { Menu, Undo, Redo, Download, Share2, MoreHorizontal, ChevronDown, Check, FileText, Sparkles, Loader2 } from 'lucide-react';

interface TopbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onDownload: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  onAutoArrange: () => void;
  isArranging?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Topbar({ 
  title, 
  onTitleChange, 
  zoom, 
  onZoomChange, 
  onDownload, 
  onExportPDF, 
  onExportDOCX,
  onAutoArrange,
  isArranging = false,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: TopbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onTitleChange(tempTitle);
    } else {
      setTempTitle(title);
    }
  };

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-md text-slate-700 transition-colors">
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
          <button className="px-3 py-1.5 hover:bg-slate-100 rounded-md transition-colors">File</button>
          <button className="px-3 py-1.5 hover:bg-slate-100 rounded-md transition-colors">Edit</button>
          <button className="px-3 py-1.5 hover:bg-slate-100 rounded-md transition-colors">View</button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-1">
          <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-md transition-colors ${canUndo ? 'hover:bg-slate-100 text-slate-700' : 'text-slate-300 cursor-not-allowed'}`} 
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-md transition-colors ${canRedo ? 'hover:bg-slate-100 text-slate-700' : 'text-slate-300 cursor-not-allowed'}`} 
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2"></div>

        {isEditingTitle ? (
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="px-2 py-1 text-sm font-bold border border-blue-400 rounded outline-none w-48"
            autoFocus
          />
        ) : (
          <div 
            className="px-2 py-1 text-sm font-bold text-slate-800 hover:bg-slate-100 rounded cursor-text truncate max-w-[200px]"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </div>
        )}
        <span className="text-xs text-slate-400 flex items-center gap-1 ml-2">
          <Check size={12} className="text-emerald-500" /> Saved
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-100 rounded-md px-2 py-1">
          <button onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))} className="px-2 text-slate-500 hover:text-slate-800">-</button>
          <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => onZoomChange(Math.min(3, zoom + 0.25))} className="px-2 text-slate-500 hover:text-slate-800">+</button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-md hover:bg-slate-50 transition-colors">
          <Share2 size={16} /> Share
        </button>
        
        <button 
          onClick={onAutoArrange} 
          disabled={isArranging}
          className={`flex items-center gap-2 px-3 py-2 border text-sm font-bold rounded-md transition-colors ${
            isArranging 
              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
          }`}
          title="AI Auto-Arrange Elements"
        >
          {isArranging ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isArranging ? 'Arranging...' : 'Magic'}
        </button>

        <button onClick={onExportPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-md hover:bg-slate-50 transition-colors">
          <FileText size={16} /> PDF
        </button>

        <button onClick={onExportDOCX} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-md hover:bg-slate-50 transition-colors">
          <FileText size={16} className="text-blue-600" /> DOCX
        </button>
        
        <button onClick={onDownload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm">
          <Download size={16} /> Download
        </button>

        <button className="p-2 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}
