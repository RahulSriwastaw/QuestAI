
import React, { useRef, useState } from 'react';
import { Upload, FileText, Zap } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  variant?: 'default' | 'button';
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled = false, variant = 'default' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size === 0) {
        return;
      }
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        return;
      }
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size === 0) {
        return;
      }
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        return;
      }
      onFileSelect(file);
    }
  };

  if (variant === 'button') {
    return (
      <>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="application/pdf" 
          onChange={handleChange}
          disabled={disabled}
        />
        <button 
          onClick={() => !disabled && fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-black uppercase rounded-xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all"
        >
          <Upload size={16} /> Upload PDF
        </button>
      </>
    );
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative w-full p-6 md:p-12 border-2 border-dashed transition-all duration-300 rounded-[32px] ${
        disabled 
          ? 'border-slate-100 bg-slate-50 cursor-not-allowed' 
          : isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl' 
            : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50/50 cursor-pointer'
      }`}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="application/pdf" 
        onChange={handleChange}
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center text-center">
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[24px] mb-4 md:mb-6 flex items-center justify-center transition-all duration-500 ${
          disabled 
            ? 'bg-slate-100 text-slate-300' 
            : isDragging 
              ? 'bg-primary text-white rotate-12' 
              : 'bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-3'
        }`}>
          <Upload className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        
        <h3 className="text-lg md:text-xl font-black text-dark mb-2">
          {isDragging ? 'Drop to Upload' : 'Upload Question Paper'}
        </h3>
        <p className="text-xs md:text-sm text-slate-400 font-medium max-w-[240px] mb-6 md:mb-8">
          Drag and drop your PDF here, or <span className="text-primary font-bold">browse files</span> from your computer.
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
            <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">PDF Format</span>
          </div>
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Extraction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
