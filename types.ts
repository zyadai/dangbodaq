
export enum Language {
  SORANI = 'Sorani (Kurdish)',
  ARABIC = 'Arabic',
  MIXED = 'Mixed (Sorani & Arabic)'
}

export enum TranscriptionMode {
  BOOK = 'book',
  RAW = 'raw'
}

export interface TranscriptionResult {
  originalText: string;
  verifiedMeaning: string;
  detectedLanguages: string[];
  timestamp: string;
}

export interface AppState {
  file: File | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  error: string | null;
  result: TranscriptionResult | null;
  targetLanguage: Language;
  mode: TranscriptionMode;
}
