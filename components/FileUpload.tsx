
import React, { useRef } from 'react';
import { Upload, FileText, Zap } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };

  return (
    <div 
      className={`group relative w-full p-8 border-2 border-dashed ${disabled ? 'border-slate-200 cursor-not-allowed' : 'border-primary/20 hover:border-primary cursor-pointer'} rounded-2xl bg-white transition-all duration-200 soft-shadow hover:shadow-lg`}
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
      
      <div className="flex flex-col items-center justify-center">
        <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${disabled ? 'bg-slate-50 text-slate-300' : 'bg-peach text-primary'}`}>
          <Upload className="w-6 h-6" />
        </div>
        
        <h3 className="text-lg font-bold text-dark mb-1">Upload PDF</h3>
        <p className="text-xs text-slate-400 text-center mb-6">
          Drag & drop or <span className="text-primary font-bold">browse</span>
        </p>
        
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            <FileText size={12} className="text-primary" /> PDF
          </div>
          <div className="w-px h-3 bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            <Zap size={12} className="text-primary" /> AI
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
