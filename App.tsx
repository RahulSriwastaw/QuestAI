
import React, { useState, useRef, useEffect } from 'react';
import { Question, ProcessStep, PageData } from './types';
import FileUpload from './components/FileUpload';
import ProcessStatus from './components/ProcessStatus';
import QuestionCard from './components/QuestionCard';
import Navbar from './components/Navbar';
import { convertPdfToImages, cropDiagram } from './services/pdfService';
import { extractQuestionsFromPage, performOCR } from './services/geminiService';
import { 
  RefreshCcw, 
  FileJson, 
  FileText, 
  FileOutput, 
  ChevronDown,
  FileCode,
  Key,
  ShieldCheck,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
    katex: any;
  }
}

const App: React.FC = () => {
  const [step, setStep] = useState<ProcessStep>(ProcessStep.IDLE);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) await window.aistudio.openSelectKey();
  };

  const handleProcess = async (file: File) => {
    try {
      setFileName(file.name);
      setQuestions([]);
      setStep(ProcessStep.LOADING_PDF);
      setMessage('Analyzing PDF document...');
      setProgress(5);

      const pages = await convertPdfToImages(file);
      setStep(ProcessStep.CONVERTING_PAGES);
      setMessage('Processing page layers...');
      setProgress(15);

      const allExtractedQuestions: Question[] = [];
      const CONCURRENCY_LIMIT = 2; 
      setStep(ProcessStep.EXTRACTING_DATA);

      for (let i = 0; i < pages.length; i += CONCURRENCY_LIMIT) {
        const batch = pages.slice(i, i + CONCURRENCY_LIMIT);
        setMessage(`Extracting content from pages ${i + 1}-${Math.min(i + CONCURRENCY_LIMIT, pages.length)}...`);
        
        const batchResults = await Promise.all(
          batch.map(async (page) => {
            try {
              const pageQuestions = await extractQuestionsFromPage(page.image, page.pageNumber);
              
              await Promise.all(pageQuestions.map(async (q) => {
                const cropAndOcrPromises = [];
                if (q.has_diagram && q.diagram_bbox) {
                  cropAndOcrPromises.push(
                    cropDiagram(page.image, q.diagram_bbox, page.width, page.height).then(async url => {
                      if (url) {
                        q.diagram_url = url;
                        q.diagram_alt_text = await performOCR(url);
                      }
                    })
                  );
                }
                const labels = ['A', 'B', 'C', 'D'] as const;
                labels.forEach(label => {
                  const bboxKey = `${label}_diagram_bbox` as keyof typeof q.options;
                  const bbox = q.options[bboxKey] as [number, number, number, number] | undefined;
                  if (bbox && bbox.length === 4) {
                    cropAndOcrPromises.push(
                      cropDiagram(page.image, bbox, page.width, page.height).then(async url => {
                        if (url) {
                          (q.options as any)[`${label}_diagram_url`] = url;
                          (q.options as any)[`${label}_diagram_alt_text`] = await performOCR(url);
                        }
                      })
                    );
                  }
                });
                await Promise.all(cropAndOcrPromises);
              }));
              return pageQuestions;
            } catch (error: any) {
              console.error(error);
              return [];
            }
          })
        );
        allExtractedQuestions.push(...batchResults.flat());
        setProgress(15 + ((i + batch.length) / pages.length) * 85);
      }

      setQuestions(allExtractedQuestions.sort((a, b) => a.question_number - b.question_number));
      setStep(ProcessStep.COMPLETED);
      setMessage(`Extracted ${allExtractedQuestions.length} questions.`);
      setProgress(100);

    } catch (error: any) {
      setStep(ProcessStep.ERROR);
      setMessage(error.message || 'Error occurred during extraction.');
    }
  };

  /**
   * Enhanced Block Rendering for PDF
   * Captures Hindi + KaTeX by rendering to a high-DPI canvas.
   * Includes essential KaTeX styles for correct math display.
   */
  const renderBlockToImage = async (
    text: string, 
    width: number, 
    fontSize: number, 
    isBold: boolean = false, 
    color: string = '#1A1A1A'
  ): Promise<{ data: string; height: number }> => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.style.width = `${width}px`;
      container.style.fontFamily = '"Inter", "Noto Sans Devanagari", "Noto Sans Math", sans-serif';
      container.style.fontSize = `${fontSize}px`;
      container.style.lineHeight = '1.6';
      container.style.fontWeight = isBold ? '700' : '400';
      container.style.color = color;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.visibility = 'hidden';
      document.body.appendChild(container);

      const parts = text.split(/(\$.*?\$)/g);
      parts.forEach(part => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          const span = document.createElement('span');
          try {
            window.katex.render(math, span, { throwOnError: false, displayMode: false });
            container.appendChild(span);
          } catch (e) {
            container.appendChild(document.createTextNode(part));
          }
        } else {
          container.appendChild(document.createTextNode(part));
        }
      });

      // Essential styles for KaTeX and Hindi fonts in ForeignObject
      // We inline the minimal CSS needed for KaTeX to avoid tainted canvas issues from external imports
      const katexStyles = `
        .katex { font-family: KaTeX_Main, 'Times New Roman', serif; line-height: 1.2; white-space: nowrap; }
        .katex-display { display: block; margin: 1em 0; text-align: center; }
        .katex-html { display: block; }
        .base { position: relative; white-space: nowrap; width: min-content; }
        .strut { display: inline-block; height: 1em; vertical-align: -0.2em; }
        div { font-family: 'Inter', 'Noto Sans Devanagari', 'Noto Sans Math', sans-serif; }
      `;

      setTimeout(async () => {
        const rect = container.getBoundingClientRect();
        const canvas = document.createElement('canvas');
        const scale = 3; 
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve({ data: '', height: 0 }); return; }
        
        ctx.scale(scale, scale);
        
        const data = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
            <defs>
              <style type="text/css">${katexStyles}</style>
            </defs>
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Inter', 'Noto Sans Devanagari', sans-serif; font-size: ${fontSize}px; line-height: 1.6; color: ${color}; font-weight: ${isBold ? '700' : '400'};">
                ${container.innerHTML}
              </div>
            </foreignObject>
          </svg>`;
        
        const img = new Image();
        const svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svg);
        
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const result = canvas.toDataURL('image/png', 1.0);
          document.body.removeChild(container);
          URL.revokeObjectURL(url);
          resolve({ data: result, height: rect.height });
        };
        img.onerror = (e) => {
          console.error("SVG Image rendering failed", e);
          document.body.removeChild(container);
          resolve({ data: '', height: 0 });
        };
        img.src = url;
      }, 100);
    });
  };

  const handleExportPDF = async () => {
    setShowExportMenu(false);
    setMessage('Generating professional PDF report...');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidthMM = pageWidth - (margin * 2);
    const contentWidthPX = contentWidthMM * 3.78; 
    let currentY = 25;

    const drawPageChrome = (pageNum: number) => {
      doc.setFillColor(255, 107, 53); 
      doc.rect(0, 0, pageWidth, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`QuestAI | Intelligent Paper Extraction Report`, margin, pageHeight - 10);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 10, pageHeight - 10);
    };

    drawPageChrome(1);
    doc.setFontSize(22);
    doc.setTextColor(26, 26, 26);
    doc.text('QuestAI Extraction Report', margin, currentY);
    currentY += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Source Document: ${fileName}`, margin, currentY);
    currentY += 5;
    doc.text(`Generated On: ${new Date().toLocaleString()}`, margin, currentY);
    currentY += 15;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qText = `Q${q.question_number}. ${q.question_text}`;
      const questionBlock = await renderBlockToImage(qText, contentWidthPX, 14, true, '#1A1A1A');
      
      // Page break check for question block
      if (currentY + (questionBlock.height / 3.78) + 15 > pageHeight - 20) {
        doc.addPage();
        drawPageChrome(doc.getNumberOfPages());
        currentY = 20;
      }

      if (questionBlock.data) {
        doc.addImage(questionBlock.data, 'PNG', margin, currentY, contentWidthMM, questionBlock.height / 3.78);
        currentY += (questionBlock.height / 3.78) + 5;
      }

      // Main question diagram
      if (q.diagram_url) {
        try {
          const img = new Image();
          img.src = q.diagram_url;
          await new Promise((resolve, reject) => { 
            img.onload = resolve; 
            img.onerror = reject;
          });
          const aspect = img.height / img.width;
          const imgW = Math.min(100, contentWidthMM - 10);
          const imgH = imgW * aspect;

          if (currentY + imgH + 5 > pageHeight - 20) {
            doc.addPage();
            drawPageChrome(doc.getNumberOfPages());
            currentY = 20;
          }

          doc.setDrawColor(245);
          doc.rect(margin + 4.5, currentY - 0.5, imgW + 1, imgH + 1);
          doc.addImage(q.diagram_url, 'PNG', margin + 5, currentY, imgW, imgH);
          currentY += imgH + 10;
        } catch (e) {
          console.warn("Failed to add diagram to PDF", e);
        }
      }

      // Options rendering
      const labels = ['A', 'B', 'C', 'D'] as const;
      for (const label of labels) {
        const optTextRaw = q.options[label];
        const optText = `(${label}) ${optTextRaw}`;
        const optBlock = await renderBlockToImage(optText, contentWidthPX - 40, 11, false, '#374151');
        const optDiagUrl = (q.options as any)[`${label}_diagram_url`];

        let blockH_MM = optBlock.height / 3.78;
        let neededSpace = blockH_MM + 4;
        let diagH_MM = 0;

        if (optDiagUrl) {
          diagH_MM = 40; // Estimated max height for option diagram
          neededSpace += diagH_MM + 2;
        }

        if (currentY + neededSpace > pageHeight - 20) {
          doc.addPage();
          drawPageChrome(doc.getNumberOfPages());
          currentY = 20;
        }

        if (optBlock.data) {
          doc.addImage(optBlock.data, 'PNG', margin + 8, currentY, contentWidthMM - 10, blockH_MM);
          currentY += blockH_MM + 2;
        }

        if (optDiagUrl) {
          try {
            const img = new Image();
            img.src = optDiagUrl;
            await new Promise((resolve) => { img.onload = resolve; });
            const aspect = img.height / img.width;
            const imgW = 40;
            const imgH = imgW * aspect;
            doc.addImage(optDiagUrl, 'PNG', margin + 12, currentY, imgW, imgH);
            currentY += imgH + 4;
          } catch (e) {
            console.warn("Failed to add option diagram to PDF", e);
          }
        }
      }

      currentY += 8;
      doc.setDrawColor(240);
      doc.line(margin, currentY - 4, pageWidth - margin, currentY - 4);
    }

    doc.save(`QuestAI_Professional_Report_${fileName.split('.')[0]}.pdf`);
    setMessage('PDF Report generated successfully.');
  };

  const handleExportWord = async () => {
    setShowExportMenu(false);
    setMessage('Generating Word document...');

    const children: any[] = [
      new Paragraph({
        text: "QuestAI Extraction Report",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Source Document: ${fileName}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Generated On: ${new Date().toLocaleString()}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "" }), // Spacer
    ];

    for (const q of questions) {
      // Question Number and Text
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Q${q.question_number}. ${q.question_text}`,
              bold: true,
              size: 24, // 12pt
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );

      // Main Diagram
      if (q.diagram_url) {
        try {
          const response = await fetch(q.diagram_url);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: arrayBuffer,
                  transformation: { width: 300, height: 200 },
                  type: "png",
                }),
              ],
              alignment: AlignmentType.CENTER,
            })
          );
          
          if (q.diagram_alt_text) {
             children.push(
                new Paragraph({
                    text: `[Image Description: ${q.diagram_alt_text}]`,
                    alignment: AlignmentType.CENTER,
                    style: "IntenseQuote"
                })
             )
          }

        } catch (e) {
          console.error("Failed to add diagram to Word doc", e);
        }
      }

      // Options
      const labels = ['A', 'B', 'C', 'D'] as const;
      for (const label of labels) {
        const optText = q.options[label];
        const optDiagUrl = (q.options as any)[`${label}_diagram_url`];
        const optAltText = (q.options as any)[`${label}_diagram_alt_text`];

        const optionParagraphChildren = [
          new TextRun({
            text: `(${label}) ${optText}`,
            size: 22, // 11pt
          }),
        ];

        if (optDiagUrl) {
           try {
            const response = await fetch(optDiagUrl);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            optionParagraphChildren.push(new TextRun({ text: "\n" }));
            optionParagraphChildren.push(
                new ImageRun({
                  data: arrayBuffer,
                  transformation: { width: 100, height: 100 },
                  type: "png",
                })
            );
             if (optAltText) {
                 optionParagraphChildren.push(new TextRun({ text: `\n[${optAltText}]`, italics: true, size: 16 }));
             }

           } catch(e) {
               console.error("Failed to add option diagram", e);
           }
        }

        children.push(
          new Paragraph({
            children: optionParagraphChildren,
            spacing: { before: 50, after: 50 },
            indent: { left: 720 }, // 0.5 inch
          })
        );
      }
      
      children.push(new Paragraph({ text: "" })); // Spacer between questions
      children.push(
          new Paragraph({
              border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } }
          })
      );
      children.push(new Paragraph({ text: "" }));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `QuestAI_Report_${fileName.split('.')[0]}.docx`;
      link.click();
      setMessage('Word Document generated successfully.');
    });
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ filename: fileName, total_questions: questions.length, questions }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a'); 
    link.href = URL.createObjectURL(blob); 
    link.download = `QuestAI_Export_${Date.now()}.json`; 
    link.click();
    setShowExportMenu(false);
  };

  const handleExportTXT = () => {
    let text = `QUESTAI EXTRACTION REPORT\nFILE: ${fileName}\nDATE: ${new Date().toLocaleString()}\n\n`;
    questions.forEach(q => {
      text += `QUESTION ${q.question_number}\n--------------------------\n`;
      text += `${q.question_text}\n\n`;
      text += `(A) ${q.options.A}\n(B) ${q.options.B}\n(C) ${q.options.C}\n(D) ${q.options.D}\n\n`;
      if (q.diagram_url) text += `[Main Diagram Attached]\n`;
      text += `\n`;
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `QuestAI_Report.txt`;
    link.click();
    setShowExportMenu(false);
  };

  const reset = () => { setStep(ProcessStep.IDLE); setQuestions([]); setProgress(0); setMessage(''); setFileName(''); };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {step === ProcessStep.IDLE ? (
          <div className="max-w-2xl mx-auto text-center mt-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-peach/50 text-primary rounded-full border border-primary/10">
              <ShieldCheck size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Advanced Vision extraction</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-dark font-display leading-tight">Quest<span className="text-primary">AI</span> Pro</h1>
              <p className="text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">Extract MCQs from complex test papers with pixel-perfect accuracy. Supports Hindi, Math, and Diagrams.</p>
            </div>
            <FileUpload onFileSelect={handleProcess} disabled={false} />
            <button onClick={handleOpenKeyDialog} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary flex items-center gap-2"><Key size={14} /> Configure Connection</button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ProcessStatus step={step} progress={progress} message={message} />
            {questions.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-3xl border border-slate-100 soft-shadow">
                  <div>
                    <h3 className="text-xl font-black text-dark">Extraction Summary</h3>
                    <div className="px-3 py-1 bg-primary/5 text-primary text-[11px] font-black rounded-lg border border-primary/10 uppercase mt-2 inline-block">{questions.length} Items Extracted</div>
                  </div>
                  <div className="flex gap-3 relative" ref={exportMenuRef}>
                    <button onClick={reset} className="px-5 py-3 text-[11px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100"><RefreshCcw size={14} /></button>
                    <div className="relative">
                      <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase text-white bg-primary rounded-2xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all">
                        <Download size={14} /> Download Results <ChevronDown size={12} />
                      </button>
                      {showExportMenu && (
                        <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <button onClick={handleExportPDF} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-peach/30 text-xs font-bold text-slate-700 transition-colors"><FileText size={16} className="text-primary" /> Professional PDF</button>
                          <button onClick={handleExportWord} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-peach/30 text-xs font-bold text-slate-700 transition-colors"><FileText size={16} className="text-blue-600" /> Word Document</button>
                          <button onClick={handleExportJSON} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-peach/30 text-xs font-bold text-slate-700 transition-colors"><FileJson size={16} className="text-primary" /> JSON Data</button>
                          <button onClick={handleExportTXT} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-peach/30 text-xs font-bold text-slate-700 transition-colors"><FileCode size={16} className="text-primary" /> Plain Text</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">{questions.map((q) => <QuestionCard key={q.id} question={q} />)}</div>
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="py-8 text-center border-t border-slate-200 bg-white"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">QuestAI Enterprise Edition &copy; 2025</p></footer>
    </div>
  );
};

export default App;
