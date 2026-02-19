
import { PageData } from '../types';

declare const pdfjsLib: any;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export async function convertPdfToImages(file: File): Promise<PageData[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    // Create an array of promises to process pages in parallel
    const pagePromises = Array.from({ length: numPages }, async (_, i) => {
      const pageNumber = i + 1;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.0 }); 
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { alpha: false });

      if (!context) return null;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: context, viewport }).promise;
      const base64Image = canvas.toDataURL('image/jpeg', 0.85);
      
      return {
        image: base64Image.split(',')[1],
        pageNumber,
        width: viewport.width,
        height: viewport.height
      };
    });

    const results = await Promise.all(pagePromises);
    return results.filter((p): p is PageData => p !== null);
  } catch (error) {
    console.error("PDF conversion failed:", error);
    throw new Error("Could not process PDF.");
  }
}

export function cropDiagram(
  base64Image: string, 
  bbox: [number, number, number, number], 
  originalWidth: number, 
  originalHeight: number
): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Image || !Array.isArray(bbox) || bbox.length !== 4) return resolve('');

    const [ymin, xmin, ymax, xmax] = bbox;
    const normXmin = Math.min(xmin, xmax);
    const normXmax = Math.max(xmin, xmax);
    const normYmin = Math.min(ymin, ymax);
    const normYmax = Math.max(ymin, ymax);

    if (normXmax - normXmin < 1 || normYmax - normYmin < 1) return resolve('');

    const img = new Image();
    const timeout = setTimeout(() => { img.src = ''; resolve(''); }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const sourceW = img.naturalWidth || img.width;
        const sourceH = img.naturalHeight || img.height;

        const rawW = ((normXmax - normXmin) / 1000) * sourceW;
        const rawH = ((normYmax - normYmin) / 1000) * sourceH;
        
        const paddingX = rawW * 0.025; 
        const paddingY = rawH * 0.025;

        const finalX = Math.max(0, (normXmin / 1000) * sourceW - paddingX);
        const finalY = Math.max(0, (normYmin / 1000) * sourceH - paddingY);
        const finalW = Math.min(sourceW - finalX, rawW + (paddingX * 2));
        const finalH = Math.min(sourceH - finalY, rawH + (paddingY * 2));

        if (finalW < 1 || finalH < 1) return resolve('');

        const canvas = document.createElement('canvas');
        canvas.width = finalW;
        canvas.height = finalH;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return resolve('');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalW, finalH);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);
        
        const result = canvas.toDataURL('image/png', 0.95);
        resolve(result);
      } catch (err) { resolve(''); }
    };

    img.onerror = () => { clearTimeout(timeout); resolve(''); };
    img.src = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
  });
}
