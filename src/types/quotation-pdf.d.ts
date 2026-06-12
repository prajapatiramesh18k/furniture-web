declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    backgroundColor?: string | null;
    logging?: boolean;
    windowWidth?: number;
    windowHeight?: number;
  }
  interface Html2Canvas {
    toDataURL: (type?: string) => string;
    width: number;
    height: number;
  }
  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<Html2Canvas>;
  export default html2canvas;
}

declare module 'jspdf' {
  interface JsPDFOptions {
    orientation?: 'portrait' | 'landscape';
    unit?: 'mm' | 'pt' | 'px' | 'in';
    format?: string | [number, number];
    compress?: boolean;
  }
  interface JsPDFInstance {
    internal: {
      pageSize: {
        getWidth: () => number;
        getHeight: () => number;
      };
    };
    addImage: (imgData: string, format: string, x: number, y: number, w: number, h: number, alias?: string, compression?: string) => void;
    addPage: () => void;
    save: (filename: string) => void;
  }
  class jsPDF {
    constructor(options?: JsPDFOptions);
    internal: JsPDFInstance['internal'];
    addImage: JsPDFInstance['addImage'];
    addPage: JsPDFInstance['addPage'];
    save: JsPDFInstance['save'];
  }
  export { jsPDF };
  export default jsPDF;
}
