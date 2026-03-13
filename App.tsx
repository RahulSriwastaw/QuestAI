
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Question, ProcessStep, PageData, DocumentData, Folder, BankQuestion, QuestionSet } from './types';
import FileUpload from './components/FileUpload';
import ProcessStatus from './components/ProcessStatus';
import QuestionCard from './components/QuestionCard';
import { QuestionEditPanel } from './components/QuestionEditPanel';
import QuestionBank from './components/QuestionBank';
import SetsView from './components/SetsView';
import CurrentAffairsGenerator from './components/CurrentAffairsGenerator';
import { convertPdfToImages, cropDiagram } from './services/pdfService';
import { extractQuestionsFromPage, performOCR } from './services/geminiService';
import { bulkEditQuestions } from './services/aiService';
import { 
  RefreshCcw, 
  FileJson, 
  FileText, 
  FileOutput, 
  ChevronDown,
  FileCode,
  Key,
  ShieldCheck,
  Download,
  Settings2,
  X,
  ArrowLeft,
  Calendar,
  Layers,
  User,
  Clock,
  Trophy,
  Search,
  Plus,
  Filter,
  Tag,
  LayoutGrid,
  List,
  Folder as FolderIcon,
  AlertCircle,
  CheckCircle2,
  Play,
  UploadCloud,
  Home,
  RotateCcw,
  Loader2,
  Menu,
  ChevronLeft,
  ChevronRight,
  Database,
  Copy,
  Globe
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { supabase } from './services/supabaseClient';

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

const AVAILABLE_FIELDS = [
  { id: 'id', label: 'Unique ID' },
  { id: 'question_number', label: 'Question Number' },
  { id: 'question_text', label: 'Question Text' },
  { id: 'options', label: 'Options (A, B, C, D)' },
  { id: 'has_diagram', label: 'Has Diagram Flag' },
  { id: 'diagram_url', label: 'Diagram URL' },
  { id: 'diagram_alt_text', label: 'Diagram Alt Text' },
  { id: 'diagram_bbox', label: 'Diagram Bounding Box' },
  { id: 'page_number', label: 'Page Number' },
];

const App: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<ProcessStep>(ProcessStep.IDLE);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  };
  const [fileName, setFileName] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeExportFormat, setActiveExportFormat] = useState<string | null>(null);

  const handleExport = (format: string, exportFn: () => Promise<void> | void) => {
    setActiveExportFormat(format);
    exportFn();
    setShowExportMenu(false);
  };
  const [showJsonCustomizer, setShowJsonCustomizer] = useState(false);
  const [showSaveToBankModal, setShowSaveToBankModal] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>(AVAILABLE_FIELDS.map(f => f.id));
  const [pdfPages, setPdfPages] = useState<PageData[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>(() => {
    try {
      const saved = localStorage.getItem('questai_documents');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [currentView, setCurrentView] = useState<'extraction' | 'bank' | 'sets' | 'current-affairs'>('extraction');
  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem('questai_folders');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('questai_bank');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });
  const [sets, setSets] = useState<QuestionSet[]>(() => {
    try {
      const saved = localStorage.getItem('questai_sets');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('questai_sets', JSON.stringify(sets));
  }, [sets]);

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
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('questai_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('questai_folders', JSON.stringify(folders));
  }, [folders]);

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
      setShowUploadModal(false);
      const newDoc: DocumentData = {
        id: Date.now().toString(),
        name: file.name,
        status: 'processing',
        totalPages: 0,
        questionsCount: 0,
        createdAt: new Date().toLocaleString(),
        author: 'rahulsriwastaw764...'
      };
      setDocuments(prev => [newDoc, ...prev]);
      setActiveDocumentId(newDoc.id);
      setFileName(file.name);
      setQuestions([]);
      setStep(ProcessStep.LOADING_PDF);
      setMessage('Analyzing PDF document...');
      setProgress(5);

      const pages = await convertPdfToImages(file);
      setPdfPages(pages);
      setSelectedPages(pages.map(p => p.pageNumber)); // Select all by default
      
      // Update document with pages
      setDocuments(prev => prev.map(doc => doc.id === newDoc.id ? { ...doc, pages, totalPages: pages.length } : doc));
      
      setStep(ProcessStep.SELECTING_PAGES);
      setMessage('Select pages to extract questions from.');
      setProgress(15);
    } catch (error: any) {
      setStep(ProcessStep.ERROR);
      setMessage(error.message || 'Error occurred during extraction.');
    }
  };

  const handleExtractFromDoc = async (doc: DocumentData) => {
    setActiveDocumentId(doc.id);
    setFileName(doc.name);
    closeSidebarOnMobile();
    
    if (doc.status === 'processed' && doc.questions) {
      setQuestions(doc.questions);
      setStep(ProcessStep.COMPLETED);
      return;
    }

    if (doc.pages) {
      setPdfPages(doc.pages);
      setSelectedPages(doc.pages.map(p => p.pageNumber));
      setStep(ProcessStep.SELECTING_PAGES);
    } else {
      // If we don't have pages, we need the file. 
      // For mock docs, we'll just simulate loading.
      setStep(ProcessStep.LOADING_PDF);
      setMessage('Loading document...');
      setProgress(10);
      setTimeout(() => {
        // Mocking page conversion for existing docs
        const mockPages: PageData[] = Array.from({ length: 5 }, (_, i) => ({
          pageNumber: i + 1,
          image: '', // Empty for mock
          width: 800,
          height: 1100
        }));
        setPdfPages(mockPages);
        setSelectedPages(mockPages.map(p => p.pageNumber));
        setStep(ProcessStep.SELECTING_PAGES);
      }, 1000);
    }
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocumentToDelete(id);
  };

  const confirmDeleteDoc = () => {
    if (documentToDelete) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete));
      setDocumentToDelete(null);
      setToast({ message: 'Document deleted successfully', type: 'success' });
    }
  };

  const cancelDeleteDoc = () => {
    setDocumentToDelete(null);
  };

  const startExtraction = async () => {
    try {
      if (selectedPages.length === 0) {
        setToast({ message: 'Please select at least one page.', type: 'error' });
        return;
      }

      const pagesToProcess = pdfPages.filter(p => selectedPages.includes(p.pageNumber));
      setStep(ProcessStep.CONVERTING_PAGES);
      setMessage('Processing page layers...');
      setProgress(15);

      const allExtractedQuestions: Question[] = [];
      const CONCURRENCY_LIMIT = 2; 
      setStep(ProcessStep.EXTRACTING_DATA);

      for (let i = 0; i < pagesToProcess.length; i += CONCURRENCY_LIMIT) {
        const batch = pagesToProcess.slice(i, i + CONCURRENCY_LIMIT);
        setMessage(`Extracting content from pages ${batch[0].pageNumber}-${batch[batch.length - 1].pageNumber}...`);
        
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
        setProgress(15 + ((i + batch.length) / pagesToProcess.length) * 85);
      }

      setQuestions(allExtractedQuestions.sort((a, b) => a.question_number - b.question_number));
      
      // Update document status
      if (activeDocumentId) {
        setDocuments(prev => prev.map(doc => doc.id === activeDocumentId ? { 
          ...doc, 
          status: 'processed', 
          questionsCount: allExtractedQuestions.length,
          questions: allExtractedQuestions
        } : doc));
      }

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

  const handleExportPDF = async (exportQuestions: Question[] = questions) => {
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
    const exportFileName = fileName || 'Question_Bank';
    doc.text(`Source Document: ${exportFileName}`, margin, currentY);
    currentY += 5;
    doc.text(`Generated On: ${new Date().toLocaleString()}`, margin, currentY);
    currentY += 15;

    for (let i = 0; i < exportQuestions.length; i++) {
      const q = exportQuestions[i];
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

    doc.save(`QuestAI_Professional_Report_${(fileName || 'Question_Bank').split('.')[0]}.pdf`);
    setMessage('PDF Report generated successfully.');
    setToast({ message: 'PDF exported successfully!', type: 'success' });
  };

  const handleExportWord = async (exportQuestions: Question[] = questions) => {
    setShowExportMenu(false);
    setMessage('Generating Word document...');

    const children: any[] = [
      new Paragraph({
        text: "QuestAI Extraction Report",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Source Document: ${fileName || 'Question Bank'}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Generated On: ${new Date().toLocaleString()}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "" }), // Spacer
    ];

    for (const q of exportQuestions) {
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

        const optionParagraphChildren: any[] = [
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
      link.download = `QuestAI_Report_${(fileName || 'Question_Bank').split('.')[0]}.docx`;
      link.click();
      setMessage('Word Document generated successfully.');
      setToast({ message: 'Word document exported successfully!', type: 'success' });
    });
  };

  const handleExportJSON = (customFields?: string[], exportQuestions: Question[] = questions) => {
    const fieldsToInclude = customFields || selectedFields;
    const filteredQuestions = exportQuestions.map(q => {
      const filteredQ: any = {};
      fieldsToInclude.forEach(field => {
        if (field in q) {
          filteredQ[field] = (q as any)[field];
        }
      });
      return filteredQ;
    });

    const dataStr = JSON.stringify({ 
      filename: fileName || 'Question_Bank', 
      total_questions: exportQuestions.length, 
      exported_fields: fieldsToInclude,
      questions: filteredQuestions 
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a'); 
    link.href = URL.createObjectURL(blob); 
    link.download = `QuestAI_Export_${customFields ? 'Custom_' : ''}${Date.now()}.json`; 
    link.click();
    setShowExportMenu(false);
    setShowJsonCustomizer(false);
    setToast({ message: 'JSON data exported successfully!', type: 'success' });
  };

  const handleExportTXT = (exportQuestions: Question[] = questions) => {
    let text = `QUESTAI EXTRACTION REPORT\nFILE: ${fileName || 'Question Bank'}\nDATE: ${new Date().toLocaleString()}\n\n`;
    exportQuestions.forEach(q => {
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
    setToast({ message: 'Text report exported successfully!', type: 'success' });
  };

  const handleCopyToClipboard = (exportQuestions: Question[] = questions) => {
    let text = `QUESTAI EXTRACTION REPORT\nFILE: ${fileName || 'Question Bank'}\nDATE: ${new Date().toLocaleString()}\n\n`;
    exportQuestions.forEach(q => {
      text += `QUESTION ${q.question_number}\n--------------------------\n`;
      text += `${q.question_text}\n\n`;
      text += `(A) ${q.options.A}\n(B) ${q.options.B}\n(C) ${q.options.C}\n(D) ${q.options.D}\n\n`;
      if (q.diagram_url) text += `[Main Diagram Attached]\n`;
      text += `\n`;
    });
    navigator.clipboard.writeText(text).then(() => {
      setShowExportMenu(false);
      setToast({ message: 'Copied to clipboard!', type: 'success' });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      setToast({ message: 'Failed to copy to clipboard.', type: 'error' });
    });
  };

  const handleExportCSV = (exportQuestions: Question[] = questions) => {
    const headers = [
      'record_id', 'question_no', 'question_hin', 'question_eng', 'subject', 'chapter',
      'option1_hin', 'option1_eng', 'option2_hin', 'option2_eng', 'option3_hin', 'option3_eng',
      'option4_hin', 'option4_eng', 'option5_hin', 'option5_eng', 'answer', 'solution_hin',
      'solution_eng', 'set_name', 'collection', 'previous_of', 'video', 'type', 'related_exam',
      'action', 'current_status', 'sync_code', 'error_report', 'error_description', 'check box', 'question_no copy'
    ];

    const rows = exportQuestions.map(q => {
      return [
        q.id,
        q.question_number,
        q.question_hin || '',
        q.question_eng || q.question_text,
        '', // subject
        '', // chapter
        q.options.A_hin || '',
        q.options.A_eng || q.options.A,
        q.options.B_hin || '',
        q.options.B_eng || q.options.B,
        q.options.C_hin || '',
        q.options.C_eng || q.options.C,
        q.options.D_hin || '',
        q.options.D_eng || q.options.D,
        '', // option5_hin
        '', // option5_eng
        q.answer || '',
        q.solution_hin || '',
        q.solution_eng || '',
        '', // set_name
        '', // collection
        '', // previous_of
        '', // video
        'MCQ', // type
        '', // related_exam
        '', // action
        'active', // current_status
        '', // sync_code
        '', // error_report
        '', // error_description
        '', // check box
        q.question_number // question_no copy
      ].map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `QuestAI_Export_${Date.now()}.csv`;
    link.click();
    setShowExportMenu(false);
    setToast({ message: 'CSV data exported successfully!', type: 'success' });
  };

  const reset = () => { 
    setStep(ProcessStep.IDLE); 
    setQuestions([]); 
    setProgress(0); 
    setMessage(''); 
    setFileName(''); 
    setPdfPages([]);
    setSelectedPages([]);
  };

  const handleAddFolder = (name: string, parentId: string | null) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      parentId,
      createdAt: Date.now()
    };
    setFolders([...folders, newFolder]);
  };

  const handleDeleteFolder = async (id: string) => {
    const getSubfolderIds = (folderId: string): string[] => {
      const children = folders.filter(f => f.parentId === folderId).map(f => f.id);
      return [folderId, ...children.flatMap(getSubfolderIds)];
    };
    const idsToDelete = getSubfolderIds(id);
    
    try {
      const { error } = await supabase.from('bank_questions').delete().in('folder_id', idsToDelete);
      if (error) throw error;
      
      setFolders(folders.filter(f => !idsToDelete.includes(f.id)));
      setBankQuestions(bankQuestions.filter(q => !q.folderId || !idsToDelete.includes(q.folderId)));
      setToast({ message: 'Folder deleted successfully', type: 'success' });
    } catch (err: any) {
      console.error('Error deleting folder:', err);
      setToast({ message: `Failed to delete folder: ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteBankQuestion = async (id: string) => {
    try {
      const { error } = await supabase.from('bank_questions').delete().eq('id', id);
      if (error) throw error;
      setBankQuestions(bankQuestions.filter(q => q.id !== id));
      setToast({ message: 'Question deleted successfully', type: 'success' });
    } catch (err: any) {
      console.error('Error deleting question:', err);
      setToast({ message: `Failed to delete: ${err.message}`, type: 'error' });
    }
  };

  const handleUpdateBankQuestion = async (updatedQuestion: Question) => {
    try {
      const { error } = await supabase
        .from('bank_questions')
        .update({
          question_data: updatedQuestion
        })
        .eq('id', updatedQuestion.id);

      if (error) throw error;

      setBankQuestions(bankQuestions.map(q => 
        q.id === updatedQuestion.id ? { ...q, ...updatedQuestion } : q
      ));
      setToast({ message: 'Question updated successfully', type: 'success' });
    } catch (err: any) {
      console.error('Error updating question:', err);
      setToast({ message: `Failed to update: ${err.message}`, type: 'error' });
    }
  };

  const handleImportCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const folderName = file.name.replace(/\.[^/.]+$/, "");
        const newFolder: Folder = {
          id: Date.now().toString(),
          name: folderName,
          parentId: null,
          createdAt: Date.now()
        };

        const importedQuestions: BankQuestion[] = results.data.map((row: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          folderId: newFolder.id,
          savedAt: Date.now(),
          question_number: row.question_number || 0,
          question_text: row.question_text || '',
          options: {
            A: row.A || '',
            B: row.B || '',
            C: row.C || '',
            D: row.D || ''
          },
          answer: row.answer || '',
          solution_hin: row.solution_hin || '',
          solution_eng: row.solution_eng || '',
          has_diagram: !!row.diagram_url,
          diagram_url: row.diagram_url || null,
          page_number: row.page_number || 1,
          diagram_bbox: undefined,
          diagram_alt_text: row.diagram_alt_text || null,
          question_hin: row.question_hin || '',
          question_eng: row.question_eng || ''
        }));
        
        setFolders([...folders, newFolder]);
        setBankQuestions([...bankQuestions, ...importedQuestions]);
        setToast({ message: `Successfully imported ${importedQuestions.length} questions into folder "${folderName}"!`, type: 'success' });
      },
      error: (err) => {
        console.error('Error parsing CSV:', err);
        setToast({ message: 'Failed to import CSV. Please check the file format.', type: 'error' });
      }
    });
  };

  const handleCreateSet = (name: string, password: string | undefined, questionIds: string[]) => {
    try {
      console.log('Creating set:', { name, questionIds });
      const newSet: QuestionSet = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name,
        password,
        questionIds,
        createdAt: Date.now()
      };
      setSets([...sets, newSet]);
      setToast({ message: `Set "${name}" created successfully!`, type: 'success' });
      setCurrentView('sets');
    } catch (err) {
      console.error('Error creating set:', err);
      setToast({ message: 'Failed to create set. Please try again.', type: 'error' });
    }
  };

  const handleDeleteSet = (id: string) => {
    setSets(sets.filter(s => s.id !== id));
    setToast({ message: 'Set deleted successfully', type: 'success' });
  };

  const handleBulkDeleteQuestions = (ids: string[]) => {
    setBankQuestions(prev => prev.filter(q => !ids.includes(q.id)));
    setToast({ message: `Successfully deleted ${ids.length} questions!`, type: 'success' });
  };

  const handleBulkEditQuestions = async (ids: string[], prompt: string) => {
    setToast({ message: 'Bulk editing questions with AI...', type: 'success' });
    
    const questionsToEdit = bankQuestions.filter(q => ids.includes(q.id));
    const { updatedQuestions, errors } = await bulkEditQuestions(questionsToEdit, prompt);
    
    setBankQuestions(prev => prev.map(q => {
      const updated = updatedQuestions.find(uq => uq.id === q.id);
      return updated ? { ...q, ...updated } : q;
    }));
    
    if (errors.length > 0) {
      console.error('Bulk edit errors:', errors);
      setToast({ 
        message: `Bulk edit completed with ${errors.length} errors. Check console for details.`, 
        type: 'error' 
      });
    } else {
      setToast({ message: `Successfully bulk edited ${updatedQuestions.length} questions!`, type: 'success' });
    }
  };

  const handleSaveToSupabase = async () => {
    try {
      setToast({ message: 'Saving to Supabase...', type: 'success' });
      const { data, error } = await supabase.from('bank_questions').insert(
        questions.map(q => {
          const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          const savedAt = Date.now();
          return {
            id,
            folder_id: selectedFolderId,
            saved_at: savedAt,
            question_data: {
              question_number: q.question_number,
              question_text: q.question_text,
              options: q.options,
              answer: q.answer,
              solution_hin: q.solution_hin,
              solution_eng: q.solution_eng,
              diagram_url: q.diagram_url,
              page_number: q.page_number,
              has_diagram: !!q.diagram_url,
            }
          };
        })
      ).select();
      
      if (error) throw error;
      
      if (data) {
        const newBankQuestions: BankQuestion[] = data.map(q => ({
          id: q.id,
          folderId: q.folder_id || null,
          savedAt: Number(q.saved_at),
          ...q.question_data
        }));
        setBankQuestions([...bankQuestions, ...newBankQuestions]);
      }
      
      setToast({ message: `Successfully saved ${questions.length} questions to Supabase!`, type: 'success' });
      setShowSaveToBankModal(false);
    } catch (err: any) {
      console.error('Error saving to Supabase:', err);
      setToast({ message: `Failed to save: ${err.message}`, type: 'error' });
    }
  };

  const handleCurrentAffairsGenerated = (generatedQuestions: Question[], topic: string, date: string) => {
    setQuestions(generatedQuestions);
    setFileName(`Current Affairs - ${date}${topic ? ` - ${topic}` : ''}`);
    setStep(ProcessStep.COMPLETED);
    setCurrentView('extraction');
    setToast({ message: `Successfully generated ${generatedQuestions.length} current affairs questions!`, type: 'success' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 py-2.5 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/10">
                <Database className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-dark font-display tracking-tight">
                Quest<span className="text-primary">AI</span>
              </span>
            </div>
          </div>
          <div className="hidden sm:block text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Intelligent Extraction
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Backdrop for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[55] md:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col fixed md:relative z-[60] md:z-40 h-full shadow-2xl md:shadow-none ${
            isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'
          } overflow-hidden`}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100 md:hidden">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Database className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-dark font-display">QuestAI</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 p-3 border-b border-slate-100">
            <button 
              onClick={() => { setCurrentView('extraction'); closeSidebarOnMobile(); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${currentView === 'extraction' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <UploadCloud size={18} /> Extraction
            </button>
            <button 
              onClick={() => { setCurrentView('bank'); closeSidebarOnMobile(); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${currentView === 'bank' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Database size={18} /> Question Bank
            </button>
            <button 
              onClick={() => { setCurrentView('sets'); closeSidebarOnMobile(); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${currentView === 'sets' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Layers size={18} /> Sets
            </button>
            <button 
              onClick={() => { setCurrentView('current-affairs'); closeSidebarOnMobile(); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${currentView === 'current-affairs' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Globe size={18} /> Current Affairs
            </button>
          </div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-dark uppercase tracking-widest">Documents</h3>
            <button 
              onClick={() => { setShowUploadModal(true); closeSidebarOnMobile(); }}
              className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              title="Upload PDF"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {(documents || []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <FolderIcon size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No History</p>
              </div>
            ) : (
              (documents || []).map((doc) => (
                <div 
                  key={doc.id} 
                  onClick={() => handleExtractFromDoc(doc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group relative ${
                    activeDocumentId === doc.id 
                      ? 'bg-primary/5 border-primary/20 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-primary/20 hover:shadow-sm'
                  }`}
                >
                  <button 
                    onClick={(e) => handleDeleteDoc(doc.id, e)}
                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      doc.status === 'idle' ? 'bg-blue-50 text-blue-500' : 
                      doc.status === 'processed' ? 'bg-emerald-50 text-emerald-500' :
                      doc.status === 'error' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {doc.status === 'idle' ? <FolderIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-dark text-sm truncate">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{doc.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {doc.status === 'processed' ? (
                        <span className="text-[9px] font-black uppercase text-emerald-500">Processed</span>
                      ) : doc.status === 'processing' ? (
                        <span className="text-[9px] font-black uppercase text-blue-500 flex items-center gap-1">
                          <Loader2 size={10} className="animate-spin" /> Processing
                        </span>
                      ) : doc.status === 'error' ? (
                        <span className="text-[9px] font-black uppercase text-red-500">Error</span>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-slate-400">Idle</span>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{doc.questionsCount} Qs</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={() => setToast({ message: 'Folder management coming soon!', type: 'success' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Plus size={14} /> New Folder
            </button>
          </div>
        </aside>

        {currentView === 'bank' ? (
          <QuestionBank 
            questions={bankQuestions}
            folders={folders}
            onAddFolder={handleAddFolder}
            onDeleteFolder={handleDeleteFolder}
            onDeleteQuestion={handleDeleteBankQuestion}
            onUpdateQuestion={handleUpdateBankQuestion}
            onExportPDF={handleExportPDF}
            onExportWord={handleExportWord}
            onExportJSON={handleExportJSON}
            onExportTXT={handleExportTXT}
            onExportCSV={handleExportCSV}
            onImportCSV={handleImportCSV}
            onCreateSet={handleCreateSet}
            onBulkDelete={handleBulkDeleteQuestions}
            onBulkEdit={handleBulkEditQuestions}
          />
        ) : currentView === 'sets' ? (
          <SetsView 
            sets={sets}
            bankQuestions={bankQuestions}
            onDeleteSet={handleDeleteSet}
            onExportPDF={handleExportPDF}
            onExportWord={handleExportWord}
            onExportJSON={handleExportJSON}
            onExportTXT={handleExportTXT}
            onExportCSV={handleExportCSV}
            onUpdateQuestion={handleUpdateBankQuestion}
          />
        ) : currentView === 'current-affairs' ? (
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <CurrentAffairsGenerator onQuestionsGenerated={handleCurrentAffairsGenerated} />
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <div className="max-w-7xl mx-auto w-full px-4 py-8">
            {step === ProcessStep.IDLE ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center text-primary mb-4">
                  <UploadCloud size={48} />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-dark font-display mb-2">Welcome to QuestAI</h1>
                  <p className="text-slate-500 font-medium max-w-md">Select a document from the sidebar or upload a new PDF to start extracting questions with intelligent AI.</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1"
                >
                  Upload Your First PDF
                </button>
              </div>
            ) : step === ProcessStep.SELECTING_PAGES ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <button onClick={reset} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-primary transition-colors">
                <ArrowLeft size={16} /> Cancel
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-black text-dark font-display">Select Pages</h2>
                <p className="text-sm text-slate-400 font-medium">{fileName} • {pdfPages.length} pages total</p>
              </div>
              <button 
                onClick={startExtraction}
                className="px-8 py-3 bg-primary text-white text-xs font-black uppercase rounded-xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
              >
                Generate Questions <FileOutput size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pdfPages.map((page) => (
                <div 
                  key={page.pageNumber}
                  onClick={() => {
                    if (selectedPages.includes(page.pageNumber)) {
                      setSelectedPages(selectedPages.filter(p => p !== page.pageNumber));
                    } else {
                      setSelectedPages([...selectedPages, page.pageNumber].sort((a, b) => a - b));
                    }
                  }}
                  className={`relative cursor-pointer rounded-2xl overflow-hidden border-4 transition-all group ${
                    selectedPages.includes(page.pageNumber) 
                      ? 'border-primary shadow-xl scale-105' 
                      : 'border-white hover:border-slate-200'
                  }`}
                >
                  {page.image ? (
                    <img 
                      src={`data:image/jpeg;base64,${page.image}`} 
                      alt={`Page ${page.pageNumber}`}
                      className="w-full aspect-[1/1.4] object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-[1/1.4] flex items-center justify-center bg-slate-100 text-slate-400 font-bold">
                      Page {page.pageNumber}
                    </div>
                  )}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                    selectedPages.includes(page.pageNumber) ? 'bg-primary/10' : 'bg-black/0 group-hover:bg-black/5'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                      selectedPages.includes(page.pageNumber) ? 'bg-primary text-white' : 'bg-white/80 text-slate-400'
                    }`}>
                      {page.pageNumber}
                    </div>
                  </div>
                  {selectedPages.includes(page.pageNumber) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                      <ShieldCheck size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setSelectedPages(pdfPages.map(p => p.pageNumber))}
                className="px-6 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors"
              >
                Select All
              </button>
              <button 
                onClick={() => setSelectedPages([])}
                className="px-6 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {step !== ProcessStep.COMPLETED && (
              <ProcessStatus step={step} progress={progress} message={message} fileName={fileName} onCancel={reset} />
            )}
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={reset} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-primary transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-2xl font-black text-dark font-display">Test Details</h2>
              <div className="flex gap-2">
                {step === ProcessStep.COMPLETED && (
                  <>
                    <button 
                      onClick={() => setShowSaveToBankModal(true)}
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <Database size={14} className="text-primary" /> Save to Bank
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="px-5 py-2.5 bg-primary text-white text-[11px] font-black uppercase rounded-xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                      >
                        <Download size={14} /> Export <ChevronDown size={12} />
                      </button>
                    {showExportMenu && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Export Options</h4>
                        </div>
                        <div className="p-2 space-y-1">
                          <button onClick={() => handleExport('design', () => navigate('/editor'))} className={`w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group ${activeExportFormat === 'design' ? 'bg-slate-100 border border-slate-200' : ''}`}>
                            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg group-hover:bg-purple-100 transition-colors"><LayoutGrid size={16} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-700">Design Editor</div>
                              <div className="text-[10px] text-slate-400 font-medium">Open in Canva-like editor</div>
                            </div>
                          </button>
                          <button onClick={() => handleExport('pdf', () => handleExportPDF())} className={`w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group ${activeExportFormat === 'pdf' ? 'bg-slate-100 border border-slate-200' : ''}`}>
                            <div className="p-2 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition-colors"><FileText size={16} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-700">PDF Document</div>
                              <div className="text-[10px] text-slate-400 font-medium">Professional layout with diagrams</div>
                            </div>
                          </button>
                          <button onClick={() => handleExport('word', () => handleExportWord())} className={`w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group ${activeExportFormat === 'word' ? 'bg-slate-100 border border-slate-200' : ''}`}>
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-100 transition-colors"><FileText size={16} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-700">Word Document</div>
                              <div className="text-[10px] text-slate-400 font-medium">Editable DOCX format</div>
                            </div>
                          </button>
                          <button onClick={() => handleExport('csv', () => handleExportCSV())} className={`w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group ${activeExportFormat === 'csv' ? 'bg-slate-100 border border-slate-200' : ''}`}>
                            <div className="p-2 bg-green-50 text-green-500 rounded-lg group-hover:bg-green-100 transition-colors"><FileCode size={16} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-700">BigBooster CSV</div>
                              <div className="text-[10px] text-slate-400 font-medium">Formatted for database import</div>
                            </div>
                          </button>
                          <button onClick={() => { setShowJsonCustomizer(true); setShowExportMenu(false); }} className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg group-hover:bg-yellow-100 transition-colors"><FileJson size={16} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-700">Custom JSON</div>
                              <div className="text-[10px] text-slate-400 font-medium">Select specific fields to export</div>
                            </div>
                          </button>
                          <button onClick={() => handleExportTXT()} className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-slate-200 transition-colors"><FileCode size={16} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-700">Plain Text</div>
                              <div className="text-[10px] text-slate-400 font-medium">Simple text format</div>
                            </div>
                          </button>
                          <button onClick={() => handleCopyToClipboard()} className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg group-hover:bg-indigo-100 transition-colors"><Copy size={16} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-700">Copy to Clipboard</div>
                              <div className="text-[10px] text-slate-400 font-medium">Copy as formatted text</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                    </div>
                  </>
                )}
                <button 
                  onClick={() => setToast({ message: 'Upgrade plan feature coming soon!', type: 'success' })}
                  className="px-5 py-2.5 bg-[#00A86B] text-white text-[11px] font-black uppercase rounded-xl hover:bg-[#008F5B] shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <LayoutGrid size={14} /> Upgrade Plan
                </button>
                <button 
                  onClick={() => setToast({ message: 'PrepLab Assist is currently in beta.', type: 'success' })}
                  className="px-5 py-2.5 bg-[#FF4D00] text-white text-[11px] font-black uppercase rounded-xl hover:bg-[#E64500] shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> PrepLab Assist
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Created</div>
                  <div className="text-base font-black text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Layers size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Questions</div>
                  <div className="text-base font-black text-slate-800">{questions.length} / 99 <span className="text-[10px] text-slate-400 font-medium ml-1">Reviewed / Total</span></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Created By</div>
                  <div className="text-base font-black text-slate-800">Rahul Kumar</div>
                  <div className="text-[10px] text-blue-500 font-bold">rahul@example.com</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Test Series</div>
                  <div className="text-base font-black text-slate-800">Not assigned</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Duration</div>
                  <div className="text-base font-black text-slate-800">Not set</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
                  <Trophy size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Marks</div>
                  <div className="text-base font-black text-slate-800">99</div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100 overflow-x-auto">
                <button className="px-6 py-4 text-xs font-black uppercase text-primary border-b-2 border-primary flex items-center gap-2 whitespace-nowrap">
                  <Layers size={14} /> Questions <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-[10px]">{questions.length}</span>
                </button>
                <button className="px-6 py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 whitespace-nowrap">
                  <FileText size={14} /> OMR Sheets
                </button>
                <button className="px-6 py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 whitespace-nowrap">
                  <User size={14} /> View Attempts
                </button>
                <button className="px-6 py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 whitespace-nowrap">
                  <Settings2 size={14} /> Settings
                </button>
              </div>

              {/* Toolbar Section */}
              <div className="p-4 bg-slate-50/30 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-black text-dark">Test Questions</h3>
                    <span className="text-[11px] font-medium text-slate-400">Showing {questions.length} of {questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                      <button className="p-1.5 rounded-md bg-blue-50 text-blue-600"><LayoutGrid size={16} /></button>
                      <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-50"><List size={16} /></button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[11px] font-black uppercase rounded-lg hover:bg-secondary transition-all">
                      <Plus size={14} /> Add Question
                    </button>
                    <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                      <button className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 rounded-md flex items-center gap-2">Select <ChevronDown size={10} className="text-slate-400" /></button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[11px] font-black uppercase text-slate-600 rounded-lg hover:bg-slate-50 transition-all">
                      <Tag size={14} className="text-orange-400" /> Bulk Tag
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[11px] font-black uppercase text-slate-600 rounded-lg hover:bg-slate-50 transition-all">
                      <Layers size={14} className="text-red-400" /> Bulk Edit
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search questions..." 
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <button className="px-8 py-3 bg-primary text-white text-xs font-black uppercase rounded-xl hover:bg-secondary transition-all">Search</button>
                </div>
              </div>

              {/* Questions Grid */}
              <div className="p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {questions.map((q) => (
                    <QuestionCard key={q.id} question={q} onEdit={setEditingQuestion} />
                  ))}
                </div>
                
                <div className="mt-10 flex flex-col items-center gap-4">
                  <span className="text-[11px] font-medium text-slate-400">Showing {questions.length} of {questions.length} questions</span>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-[11px] font-black uppercase text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                    Load More Questions <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )}
</div>

{/* Edit Question Panel */}
{editingQuestion && (
  <QuestionEditPanel
    question={editingQuestion}
    onClose={() => setEditingQuestion(null)}
    onSave={(updatedQuestion) => {
      handleUpdateQuestion(updatedQuestion);
      setEditingQuestion(null);
    }}
  />
)}

{/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-dark">Upload New Document</h3>
                <p className="text-xs text-slate-400 font-medium">Select a PDF file to start extracting questions.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Save to Folder (Optional)</label>
              <select 
                value={selectedFolderId || ''} 
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
              >
                <option value="">Root (No Folder)</option>
                {folders.map(folder => {
                  const getFolderPath = (fId: string): string => {
                    const f = folders.find(f => f.id === fId);
                    if (!f) return '';
                    if (!f.parentId) return f.name;
                    return `${getFolderPath(f.parentId)} / ${f.name}`;
                  };
                  return (
                    <option key={folder.id} value={folder.id}>
                      {getFolderPath(folder.id)}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="p-4 md:p-8">
              <FileUpload onFileSelect={handleProcess} disabled={false} />
            </div>
            <div className="p-4 md:p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2.5 text-xs font-black uppercase text-slate-400 hover:text-dark transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleOpenKeyDialog} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary flex items-center gap-2"><Key size={14} /> Configure Connection</button>
            </div>
          </div>
        </div>
      )}

      {/* Save to Bank Modal */}
      {showSaveToBankModal && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-dark">Save to Question Bank</h3>
                <p className="text-xs text-slate-400 font-medium">Select a folder to save {questions.length} questions.</p>
              </div>
              <button onClick={() => setShowSaveToBankModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-2">
              <div 
                onClick={() => setSelectedFolderId(null)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedFolderId === null 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Database size={16} />
                </div>
                <span className="font-bold text-sm text-slate-700">Root (No Folder)</span>
              </div>
              {folders.map(folder => {
                const getFolderPath = (fId: string): string => {
                  const f = folders.find(f => f.id === fId);
                  if (!f) return '';
                  if (!f.parentId) return f.name;
                  return `${getFolderPath(f.parentId)} / ${f.name}`;
                };
                return (
                  <div 
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedFolderId === folder.id 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                      <FolderIcon size={16} />
                    </div>
                    <span className="font-bold text-sm text-slate-700">{getFolderPath(folder.id)}</span>
                  </div>
                );
              })}
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowSaveToBankModal(false)}
                className="flex-1 px-4 py-3 text-[11px] font-black uppercase text-slate-500 hover:text-dark transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveToSupabase}
                className="flex-[2] px-6 py-3 bg-primary text-white text-[11px] font-black uppercase rounded-2xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <Database size={14} /> Save Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Customizer Modal */}
      {showJsonCustomizer && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-dark">Customize JSON Export</h3>
                <p className="text-xs text-slate-400 font-medium">Select the fields you want to include in the file.</p>
              </div>
              <button onClick={() => setShowJsonCustomizer(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_FIELDS.map((field) => (
                  <label key={field.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFields([...selectedFields, field.id]);
                        } else {
                          setSelectedFields(selectedFields.filter(id => id !== field.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary transition-all"
                    />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-dark transition-colors">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setSelectedFields(selectedFields.length === AVAILABLE_FIELDS.length ? [] : AVAILABLE_FIELDS.map(f => f.id))}
                className="flex-1 px-4 py-3 text-[11px] font-black uppercase text-slate-500 hover:text-dark transition-colors bg-white border border-slate-200 rounded-2xl"
              >
                {selectedFields.length === AVAILABLE_FIELDS.length ? 'Deselect All' : 'Select All'}
              </button>
              <button 
                onClick={() => handleExportJSON()}
                disabled={selectedFields.length === 0}
                className="flex-[2] px-6 py-3 bg-primary text-white text-[11px] font-black uppercase rounded-2xl hover:bg-secondary shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Download size={14} /> Export {selectedFields.length} Fields
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {documentToDelete && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 text-red-500">
              <AlertCircle size={24} />
              <h3 className="text-lg font-black text-dark">Delete Document</h3>
            </div>
            <div className="p-6 text-slate-600 text-sm">
              Are you sure you want to delete this document? This action cannot be undone.
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={cancelDeleteDoc}
                className="flex-1 px-4 py-3 text-[11px] font-black uppercase text-slate-500 hover:text-dark transition-colors bg-white border border-slate-200 rounded-2xl"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteDoc}
                className="flex-1 px-6 py-3 bg-red-500 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <footer className="py-8 text-center border-t border-slate-200 bg-white"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">QuestAI Enterprise Edition &copy; 2025</p></footer>
    </div>
  );
};

export default App;
