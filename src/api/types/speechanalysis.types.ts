


export interface TranscriptionResponse {
  transcription: string;
  confidence?: number | null;
  language?: string;
  processing_time?: number | null;
}
