import React from 'react';
import { 
  Settings, Type, Square, Image as ImageIcon, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Bold, Italic, Underline, Strikethrough,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  AlignHorizontalDistributeCenter, AlignVerticalDistributeCenter, Trash2,
  Group, Ungroup, Plus, Minus, Table, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { CanvasElement, TextElement, ShapeElement, TableElement } from './types';

interface RightPanelProps {
  selectedElements: CanvasElement[];
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateElements: (ids: string[], updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => void;
  onDeleteElement: (id: string) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicateElement: () => void;
  pageBackground: string;
  onPageBackgroundChange: (bg: string) => void;
}

export function RightPanel({ 
  selectedElements, 
  onUpdateElement, 
  onUpdateElements,
  onDeleteElement, 
  onGroup,
  onUngroup,
  onDuplicateElement,
  pageBackground, 
  onPageBackgroundChange 
}: RightPanelProps) {
  const element = selectedElements.length === 1 ? selectedElements[0] : null;

  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElements.length < 2) return;

    const ids = selectedElements.map(el => el.id);
    const minX = Math.min(...selectedElements.map(el => el.x));
    const maxX = Math.max(...selectedElements.map(el => el.x + el.width));
    const minY = Math.min(...selectedElements.map(el => el.y));
    const maxY = Math.max(...selectedElements.map(el => el.y + el.height));
    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;

    switch (type) {
      case 'left':
        onUpdateElements(ids, { x: minX });
        break;
      case 'center':
        onUpdateElements(ids, (el) => ({ x: centerX - el.width / 2 }));
        break;
      case 'right':
        onUpdateElements(ids, (el) => ({ x: maxX - el.width }));
        break;
      case 'top':
        onUpdateElements(ids, { y: minY });
        break;
      case 'middle':
        onUpdateElements(ids, (el) => ({ y: centerY - el.height / 2 }));
        break;
      case 'bottom':
        onUpdateElements(ids, (el) => ({ y: maxY - el.height }));
        break;
    }
  };

  const handleDistribute = (type: 'horizontal' | 'vertical') => {
    if (selectedElements.length < 3) return;

    const sorted = [...selectedElements].sort((a, b) => type === 'horizontal' ? a.x - b.x : a.y - b.y);
    const ids = sorted.map(el => el.id);
    
    if (type === 'horizontal') {
      const minX = sorted[0].x;
      const maxX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width;
      const totalWidths = sorted.reduce((sum, el) => sum + el.width, 0);
      const gap = (maxX - minX - totalWidths) / (sorted.length - 1);
      
      let currentX = minX;
      sorted.forEach((el, i) => {
        onUpdateElement(el.id, { x: currentX });
        currentX += el.width + gap;
      });
    } else {
      const minY = sorted[0].y;
      const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
      const totalHeights = sorted.reduce((sum, el) => sum + el.height, 0);
      const gap = (maxY - minY - totalHeights) / (sorted.length - 1);
      
      let currentY = minY;
      sorted.forEach((el, i) => {
        onUpdateElement(el.id, { y: currentY });
        currentY += el.height + gap;
      });
    }
  };

  if (selectedElements.length === 0) {
    return (
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col h-full z-10 shadow-[-2px_0_8px_rgba(0,0,0,0.02)] p-4 overflow-y-auto">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Settings size={16} className="text-slate-400" /> Page Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Background Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={pageBackground} 
                onChange={(e) => onPageBackgroundChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              />
              <input 
                type="text" 
                value={pageBackground} 
                onChange={(e) => onPageBackgroundChange(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 font-mono uppercase"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedElements.length > 1) {
    return (
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col h-full z-10 shadow-[-2px_0_8px_rgba(0,0,0,0.02)] p-4 overflow-y-auto">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Settings size={16} className="text-slate-400" /> Selection ({selectedElements.length})
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Align</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleAlign('left')} title="Align Left" className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center"><AlignStartHorizontal size={18} /></button>
              <button onClick={() => handleAlign('center')} title="Align Center" className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center"><AlignCenterHorizontal size={18} /></button>
              <button onClick={() => handleAlign('right')} title="Align Right" className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center"><AlignEndHorizontal size={18} /></button>
              <button onClick={() => handleAlign('top')} title="Align Top" className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center"><AlignStartVertical size={18} /></button>
              <button onClick={() => handleAlign('middle')} title="Align Middle" className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center"><AlignCenterVertical size={18} /></button>
              <button onClick={() => handleAlign('bottom')} title="Align Bottom" className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center"><AlignEndVertical size={18} /></button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Distribute</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleDistribute('horizontal')} title="Distribute Horizontally" className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold"><AlignHorizontalDistributeCenter size={18} /> Horizontal</button>
              <button onClick={() => handleDistribute('vertical')} title="Distribute Vertically" className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold"><AlignVerticalDistributeCenter size={18} /> Vertical</button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Actions</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onGroup} className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold"><Group size={18} /> Group</button>
              <button onClick={onUngroup} className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold"><Ungroup size={18} /> Ungroup</button>
              <button onClick={onDuplicateElement} className="p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold col-span-2"><Plus size={18} /> Duplicate</button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              onClick={() => selectedElements.forEach(el => onDeleteElement(el.id))}
              className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete Selected
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col h-full z-10 shadow-[-2px_0_8px_rgba(0,0,0,0.02)] p-4 overflow-y-auto">
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
        {element?.type === 'text' && <Type size={16} className="text-slate-400" />}
        {element?.type === 'shape' && <Square size={16} className="text-slate-400" />}
        {element?.type === 'image' && <ImageIcon size={16} className="text-slate-400" />}
        {element?.type === 'question_block' && <Settings size={16} className="text-slate-400" />}
        {element?.type} Settings
      </h3>

      <div className="space-y-6">
        {/* Common Properties */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">X</label>
            <input 
              type="number" 
              value={Math.round(element!.x)} 
              onChange={(e) => onUpdateElement(element!.id, { x: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Y</label>
            <input 
              type="number" 
              value={Math.round(element!.y)} 
              onChange={(e) => onUpdateElement(element!.id, { y: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">W</label>
            <input 
              type="number" 
              value={Math.round(element!.width)} 
              onChange={(e) => onUpdateElement(element!.id, { width: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">H</label>
            <input 
              type="number" 
              value={Math.round(element!.height)} 
              onChange={(e) => onUpdateElement(element!.id, { height: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Rotation</label>
            <input 
              type="number" 
              value={Math.round(element!.rotation)} 
              onChange={(e) => onUpdateElement(element!.id, { rotation: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Visibility & Locking</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onUpdateElement(element!.id, { hidden: !element!.hidden })}
              className={`px-2 py-1.5 text-xs rounded font-medium flex items-center justify-center gap-2 transition-colors ${
                element!.hidden ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {element!.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              {element!.hidden ? 'Hidden' : 'Visible'}
            </button>
            <button 
              onClick={() => onUpdateElement(element!.id, { locked: !element!.locked })}
              className={`px-2 py-1.5 text-xs rounded font-medium flex items-center justify-center gap-2 transition-colors ${
                element!.locked ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {element!.locked ? <Lock size={14} /> : <Unlock size={14} />}
              {element!.locked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Layering</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button 
              onClick={() => onUpdateElement(element!.id, { zIndex: element!.zIndex + 1 })}
              className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
            >
              Bring Forward
            </button>
            <button 
              onClick={() => onUpdateElement(element!.id, { zIndex: element!.zIndex - 1 })}
              className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
            >
              Send Backward
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => {
                const currentPage = selectedElements[0].groupId ? null : null; // Need access to all elements
                // Actually, I should just pass a high/low number or handle it in EditorPage
                onUpdateElement(element!.id, { zIndex: 999 });
              }}
              className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
            >
              Bring to Front
            </button>
            <button 
              onClick={() => onUpdateElement(element!.id, { zIndex: -999 })}
              className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
            >
              Send to Back
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Alignment</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onUpdateElement(element!.id, { x: 0 })} className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium">Left</button>
            <button onClick={() => onUpdateElement(element!.id, { x: 397 - element!.width / 2 })} className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium">Center</button>
            <button onClick={() => onUpdateElement(element!.id, { x: 794 - element!.width })} className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium">Right</button>
          </div>
        </div>

        {/* Table Properties */}
        {element?.type === 'table' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rows</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const table = element as TableElement;
                      if (table.rows > 1) {
                        const newData = table.data.slice(0, -1);
                        onUpdateElement(element.id, { rows: table.rows - 1, data: newData, height: (table.rows - 1) * (table.height / table.rows) });
                      }
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-8 text-center">{(element as TableElement).rows}</span>
                  <button 
                    onClick={() => {
                      const table = element as TableElement;
                      const newData = [...table.data, Array(table.cols).fill('')];
                      onUpdateElement(element.id, { rows: table.rows + 1, data: newData, height: (table.rows + 1) * (table.height / table.rows) });
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cols</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const table = element as TableElement;
                      if (table.cols > 1) {
                        const newData = table.data.map(row => row.slice(0, -1));
                        onUpdateElement(element.id, { cols: table.cols - 1, data: newData, width: (table.cols - 1) * (table.width / table.cols) });
                      }
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-8 text-center">{(element as TableElement).cols}</span>
                  <button 
                    onClick={() => {
                      const table = element as TableElement;
                      const newData = table.data.map(row => [...row, '']);
                      onUpdateElement(element.id, { cols: table.cols + 1, data: newData, width: (table.cols + 1) * (table.width / table.cols) });
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cell Data</label>
              <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-2">
                {(element as TableElement).data.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-2">
                    {row.map((cell, cIdx) => (
                      <input 
                        key={cIdx}
                        type="text"
                        value={cell}
                        onChange={(e) => {
                          const table = element as TableElement;
                          const newData = [...table.data];
                          newData[rIdx] = [...newData[rIdx]];
                          newData[rIdx][cIdx] = e.target.value;
                          onUpdateElement(element.id, { data: newData });
                        }}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Question Block Properties */}
        {element?.type === 'question_block' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Font Family</label>
              <select 
                value={(element as any).fontFamily} 
                onChange={(e) => onUpdateElement(element.id, { fontFamily: e.target.value })}
                className="w-full px-2 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50 font-medium"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Inter">Inter</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Outfit">Outfit</option>
                <option value="Libre Baskerville">Libre Baskerville</option>
                <option value="Cormorant Garamond">Cormorant Garamond</option>
                <option value="Anton">Anton</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Size</label>
                <input 
                  type="number" 
                  value={(element as any).fontSize} 
                  onChange={(e) => onUpdateElement(element.id, { fontSize: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={(element as any).fill} 
                    onChange={(e) => onUpdateElement(element.id, { fill: e.target.value })}
                    className="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <input 
                    type="text" 
                    value={(element as any).fill} 
                    onChange={(e) => onUpdateElement(element.id, { fill: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-400 bg-slate-50 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text Properties */}
        {element?.type === 'text' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Font Family</label>
              <select 
                value={element.fontFamily} 
                onChange={(e) => onUpdateElement(element.id, { fontFamily: e.target.value })}
                className="w-full px-2 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50 font-medium"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Inter">Inter</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Outfit">Outfit</option>
                <option value="Libre Baskerville">Libre Baskerville</option>
                <option value="Cormorant Garamond">Cormorant Garamond</option>
                <option value="Anton">Anton</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Size</label>
                <input 
                  type="number" 
                  value={element.fontSize} 
                  onChange={(e) => onUpdateElement(element.id, { fontSize: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={element.fill} 
                    onChange={(e) => onUpdateElement(element.id, { fill: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Style</label>
              <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => onUpdateElement(element.id, { fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`flex-1 p-1.5 rounded flex items-center justify-center transition-colors ${element.fontWeight === 'bold' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Bold size={16} />
                </button>
                <button 
                  onClick={() => onUpdateElement(element.id, { fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`flex-1 p-1.5 rounded flex items-center justify-center transition-colors ${element.fontStyle === 'italic' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Italic size={16} />
                </button>
                <button 
                  onClick={() => onUpdateElement(element.id, { textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' })}
                  className={`flex-1 p-1.5 rounded flex items-center justify-center transition-colors ${element.textDecoration === 'underline' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Underline size={16} />
                </button>
                <button 
                  onClick={() => onUpdateElement(element.id, { textDecoration: element.textDecoration === 'line-through' ? 'none' : 'line-through' })}
                  className={`flex-1 p-1.5 rounded flex items-center justify-center transition-colors ${element.textDecoration === 'line-through' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Strikethrough size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Alignment</label>
              <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => onUpdateElement(element.id, { align: 'left' })}
                  className={`flex-1 p-1.5 rounded flex items-center justify-center transition-colors ${element.align === 'left' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <AlignLeft size={16} />
                </button>
                <button 
                  onClick={() => onUpdateElement(element.id, { align: 'center' })}
                  className={`flex-1 p-1.5 rounded flex items-center justify-center transition-colors ${element.align === 'center' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <AlignCenter size={16} />
                </button>
                <button 
                  onClick={() => onUpdateElement(element.id, { align: 'right' })}
                  className={`flex-1 p-1.5 rounded flex items-center justify-center transition-colors ${element.align === 'right' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <AlignRight size={16} />
                </button>
                <button 
                  onClick={() => onUpdateElement(element.id, { align: 'justify' })}
                  className={`flex-1 p-1.5 rounded flex items-center justify-center transition-colors ${element.align === 'justify' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <AlignJustify size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Properties */}
        {element?.type === 'image' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Opacity</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={element.opacity ?? 1} 
                onChange={(e) => onUpdateElement(element.id, { opacity: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Shape Properties */}
        {element?.type === 'shape' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Fill Color</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={element.fill} 
                  onChange={(e) => onUpdateElement(element.id, { fill: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  value={element.fill} 
                  onChange={(e) => onUpdateElement(element.id, { fill: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 font-mono uppercase bg-slate-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Stroke Color</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={element.stroke} 
                  onChange={(e) => onUpdateElement(element.id, { stroke: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  value={element.stroke} 
                  onChange={(e) => onUpdateElement(element.id, { stroke: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 font-mono uppercase bg-slate-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Stroke Width</label>
              <input 
                type="number" 
                value={element.strokeWidth} 
                onChange={(e) => onUpdateElement(element.id, { strokeWidth: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50"
              />
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100">
          <button 
            onClick={() => onDeleteElement(element!.id)}
            className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold rounded-lg transition-colors"
          >
            Delete Element
          </button>
        </div>
      </div>
    </div>
  );
}
