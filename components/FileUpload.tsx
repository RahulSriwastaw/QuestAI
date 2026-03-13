
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-lg hover:bg-secondary shadow-sm shadow-primary/20 transition-all"
        >
          <Upload size={14} /> Upload PDF
        </button>
      </>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative w-full p-4 md:p-8 border-2 border-dashed transition-all duration-300 rounded-2xl ${
        disabled 
          ? 'border-slate-100 bg-slate-50 cursor-not-allowed' 
          : isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-md' 
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
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl mb-3 md:mb-4 flex items-center justify-center transition-all duration-500 ${
          disabled 
            ? 'bg-slate-100 text-slate-300' 
            : isDragging 
              ? 'bg-primary text-white rotate-12' 
              : 'bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-3'
        }`}>
          <Upload className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        
        <h3 className="text-base md:text-lg font-black text-dark mb-1">
          {isDragging ? 'Drop to Upload' : 'Upload Question Paper'}
        </h3>
        <p className="text-[10px] md:text-xs text-slate-400 font-medium max-w-[240px] mb-4 md:mb-6">
          Drag and drop your PDF here, or <span className="text-primary font-bold">browse files</span> from your computer.
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
            <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">PDF Format</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
            <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">AI Extraction</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FileUpload;
