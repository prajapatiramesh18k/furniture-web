export {};

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js' | 'set',
      targetOrName: string | Date,
      params?: Record<string, string | number | boolean | undefined>
    ) => void;
  }
}
