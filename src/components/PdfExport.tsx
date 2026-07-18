import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Test, TestResult } from '../types';

interface PdfExportProps {
  test: Test;
  result: TestResult;
  onComplete: () => void;
}

export async function generatePdfReport(
  elementId: string,
  testTitle: string,
  themeColor: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Temperarily modify styles for clean PDF export
    const originalStyle = element.style.cssText;
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    element.style.width = '700px'; // Set standard width for high-density rendering

    const canvas = await html2canvas(element, {
      scale: 2, // Retain sharp fonts
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Restore original styles
    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Scale canvas to match page width
    const ratio = pdfWidth / (imgWidth / 2); // Divide by 2 due to scale=2
    const pageHeightImg = pdfHeight / ratio;

    let heightLeft = imgHeight / 2;
    let position = 0;
    let pageNum = 1;

    // Add first page
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      position,
      pdfWidth,
      (imgHeight / 2) * ratio,
      `page-${pageNum}`,
      'FAST'
    );
    heightLeft -= pageHeightImg;

    // Handle multi-page PDFs cleanly
    while (heightLeft > 0) {
      position = -(pageHeightImg * pageNum);
      pdf.addPage();
      pdf.addImage(
        imgData,
        'JPEG',
        0,
        position,
        pdfWidth,
        (imgHeight / 2) * ratio,
        `page-${pageNum + 1}`,
        'FAST'
      );
      heightLeft -= pageHeightImg;
      pageNum++;
    }

    pdf.save(`Результат_Теста_${testTitle.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Ошибка генерации PDF:', error);
  }
}
