/**
 * Shared client-side PDF export helper.
 * Deduplicates the html2canvas + jspdf dynamic-import pattern
 * previously triplicated in quotation-maker, receipt, and payroll.
 */

export interface PdfExportOptions {
  filename: string;
  /** html2canvas scale (default 2.5) */
  scale?: number;
  /** A4 margin in mm (default 8) */
  margin?: number;
}

export async function exportElementToPdf(
  target: HTMLElement,
  { filename, scale = 2.5, margin = 8 }: PdfExportOptions
): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  const canvas = await html2canvas(target, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: target.scrollWidth,
  });
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxW = pageWidth - margin * 2;
  const maxH = pageHeight - margin * 2;
  const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
  const renderW = canvas.width * ratio;
  const renderH = canvas.height * ratio;
  const posX = margin + (maxW - renderW) / 2;
  const posY = margin + Math.max(0, (maxH - renderH) / 8);
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');
  pdf.save(filename);
}

export async function waitForImages(target: HTMLElement, timeoutMs = 5000): Promise<void> {
  await Promise.all(
    Array.from(target.querySelectorAll('img')).map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const onDone = () => resolve();
            img.addEventListener('load', onDone, { once: true });
            img.addEventListener('error', onDone, { once: true });
            setTimeout(onDone, timeoutMs);
          })
    )
  );
}
